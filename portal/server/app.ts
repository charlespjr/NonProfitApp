import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { and, eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { databaseUrl, getDb } from './db.js'
import { orgs, orgState, users } from './schema.js'
import { billing } from './billing.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'
const COOKIE = 'quorum_session'
const SESSION_TTL_S = 60 * 60 * 24 * 14 // 14 days

export interface SessionUser {
  userId: string
  orgId: string
}

export async function createSession(c: Context, s: SessionUser) {
  const token = await sign(
    { sub: s.userId, org: s.orgId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S },
    JWT_SECRET,
  )
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_S,
  })
}

async function readSession(c: Context): Promise<SessionUser | null> {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    if (typeof payload.sub !== 'string' || typeof payload.org !== 'string') return null
    return { userId: payload.sub, orgId: payload.org }
  } catch {
    return null
  }
}

type Env = { Variables: { session: SessionUser; me: typeof users.$inferSelect } }

async function requireAuth(c: Context<Env>, next: Next) {
  const session = await readSession(c)
  if (!session) return c.json({ error: 'unauthenticated' }, 401)
  const db = await getDb()
  const [me] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, session.userId), eq(users.orgId, session.orgId)))
  if (!me) return c.json({ error: 'unauthenticated' }, 401)
  c.set('session', session)
  c.set('me', me)
  await next()
}

async function requireAdmin(c: Context<Env>, next: Next) {
  if (!c.get('me').isAdmin) return c.json({ error: 'admin only' }, 403)
  await next()
}

const id = (prefix: string) => prefix + crypto.randomUUID().replace(/-/g, '').slice(0, 20)

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

function publicUser(u: typeof users.$inferSelect) {
  const { passwordHash: _drop, ...rest } = u
  return rest
}

export const app = new Hono<Env>().basePath('/api')

app.get('/health', (c) =>
  c.json({
    ok: true,
    build: 4,
    // Diagnostics: is a real database wired in, and which db-ish env var
    // NAMES exist (never values). Safe to expose; invaluable when a
    // marketplace integration injects credentials under a surprise name.
    dbConfigured: !!databaseUrl(),
    dbEnvKeys: Object.keys(process.env)
      .filter((k) => /DATABASE|POSTGRES|PGHOST|PGUSER|NEON|STORAGE/i.test(k))
      .sort(),
  }),
)

// ----------------------------------------------------------------- auth
app.post('/auth/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  const orgName = (body?.orgName || '').trim()
  const name = (body?.name || '').trim()
  const email = (body?.email || '').trim().toLowerCase()
  const username = (body?.username || '').trim().toLowerCase()
  const password = body?.password || ''
  if (!orgName || !name || !email || !username || password.length < 8) {
    return c.json({ error: 'orgName, name, email, username, and a password of 8+ characters are required' }, 400)
  }
  const db = await getDb()
  const orgId = id('org_')
  const userId = id('usr_')
  await db.insert(orgs).values({ id: orgId, name: orgName })
  await db.insert(users).values({
    id: userId,
    orgId,
    name,
    roleTitle: 'Founder & Administrator',
    initials: initials(name),
    username,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    isAdmin: true,
    canVote: true,
    canSign: true,
    status: 'active',
  })
  await db.insert(orgState).values({ orgId, data: {}, version: 0 })
  await createSession(c, { userId, orgId })
  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId))
  const [me] = await db.select().from(users).where(eq(users.id, userId))
  return c.json({ org, me: publicUser(me) }, 201)
})

app.post('/auth/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const identifier = (body?.identifier || '').trim().toLowerCase()
  const password = body?.password || ''
  if (!identifier) return c.json({ error: 'enter your username or email' }, 400)
  const db = await getDb()
  const rows = await db.select().from(users)
  // Username/email are unique per org, not globally; multiple orgs can have
  // the same identifier. Password decides which account matches.
  const candidates = rows.filter(
    (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier,
  )
  for (const u of candidates) {
    if (u.passwordHash && (await bcrypt.compare(password, u.passwordHash))) {
      if (u.status !== 'active') {
        const db2 = await getDb()
        await db2.update(users).set({ status: 'active' }).where(eq(users.id, u.id))
      }
      await createSession(c, { userId: u.id, orgId: u.orgId })
      const [org] = await db.select().from(orgs).where(eq(orgs.id, u.orgId))
      return c.json({ org, me: publicUser({ ...u, status: 'active' }) })
    }
  }
  return c.json({ error: 'No account matches those credentials.' }, 401)
})

app.post('/auth/logout', (c) => {
  deleteCookie(c, COOKIE, { path: '/' })
  return c.json({ ok: true })
})

app.get('/auth/me', requireAuth, async (c) => {
  const db = await getDb()
  const [org] = await db.select().from(orgs).where(eq(orgs.id, c.get('session').orgId))
  return c.json({ org, me: publicUser(c.get('me')) })
})

app.post('/auth/change-password', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null)
  const password = body?.password || ''
  if (password.length < 8) return c.json({ error: 'password must be 8+ characters' }, 400)
  const db = await getDb()
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10), mustChangePassword: false })
    .where(eq(users.id, c.get('me').id))
  return c.json({ ok: true })
})

// ------------------------------------------------------------ org state
app.get('/state', requireAuth, async (c) => {
  const db = await getDb()
  const [row] = await db.select().from(orgState).where(eq(orgState.orgId, c.get('session').orgId))
  return c.json({ data: row?.data ?? {}, version: row?.version ?? 0 })
})

app.put('/state', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.data !== 'object' || typeof body.version !== 'number') {
    return c.json({ error: 'data (object) and version (number) required' }, 400)
  }
  const db = await getDb()
  const orgId = c.get('session').orgId
  const [row] = await db.select().from(orgState).where(eq(orgState.orgId, orgId))
  const current = row?.version ?? 0
  if (body.version !== current) {
    return c.json({ error: 'version conflict', current, data: row?.data ?? {} }, 409)
  }
  const next = current + 1
  await db
    .update(orgState)
    .set({ data: body.data, version: next, updatedAt: new Date() })
    .where(eq(orgState.orgId, orgId))
  return c.json({ version: next })
})

// -------------------------------------------------------------- members
app.get('/members', requireAuth, async (c) => {
  const db = await getDb()
  const rows = await db.select().from(users).where(eq(users.orgId, c.get('session').orgId))
  return c.json({ members: rows.map(publicUser) })
})

app.post('/members', requireAuth, requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null)
  const name = (body?.name || '').trim()
  const username = (body?.username || '').trim().toLowerCase()
  const email = (body?.email || '').trim().toLowerCase()
  const password = body?.password || ''
  if (!name || !username || !email) return c.json({ error: 'name, username, and email are required' }, 400)
  const db = await getDb()
  const orgId = c.get('session').orgId
  const existing = await db.select().from(users).where(eq(users.orgId, orgId))
  if (existing.some((u) => u.username === username)) return c.json({ error: 'username already in use' }, 409)
  if (existing.some((u) => u.email === email)) return c.json({ error: 'email already in use' }, 409)
  const userId = id('usr_')
  await db.insert(users).values({
    id: userId,
    orgId,
    name,
    roleTitle: (body?.roleTitle || 'Director').trim(),
    initials: initials(name),
    username,
    email,
    passwordHash: password ? await bcrypt.hash(password, 10) : null,
    isAdmin: false,
    canVote: body?.canVote !== false,
    canSign: !!body?.canSign,
    status: password ? 'invited' : 'none',
    mustChangePassword: !!password,
  })
  const [row] = await db.select().from(users).where(eq(users.id, userId))
  return c.json({ member: publicUser(row) }, 201)
})

app.patch('/members/:id', requireAuth, requireAdmin, async (c) => {
  const db = await getDb()
  const orgId = c.get('session').orgId
  const targetId = c.req.param('id') || ''
  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, targetId), eq(users.orgId, orgId)))
  if (!target) return c.json({ error: 'not found' }, 404)
  const body = await c.req.json().catch(() => ({}))
  const patch: Partial<typeof users.$inferInsert> = {}
  if (typeof body.name === 'string' && body.name.trim()) {
    patch.name = body.name.trim()
    patch.initials = initials(body.name)
  }
  if (typeof body.roleTitle === 'string' && body.roleTitle.trim()) patch.roleTitle = body.roleTitle.trim()
  if (typeof body.username === 'string' && body.username.trim()) patch.username = body.username.trim().toLowerCase()
  if (typeof body.email === 'string' && body.email.trim()) patch.email = body.email.trim().toLowerCase()
  if (typeof body.canVote === 'boolean') patch.canVote = body.canVote
  if (typeof body.canSign === 'boolean') patch.canSign = body.canSign
  if (typeof body.password === 'string' && body.password) {
    patch.passwordHash = await bcrypt.hash(body.password, 10)
    patch.mustChangePassword = true
    if (target.status === 'none') patch.status = 'invited'
  }
  // Admins cannot demote themselves; the org always keeps one admin.
  if (typeof body.isAdmin === 'boolean' && targetId !== c.get('me').id) patch.isAdmin = body.isAdmin
  await db.update(users).set(patch).where(eq(users.id, targetId))
  const [row] = await db.select().from(users).where(eq(users.id, targetId))
  return c.json({ member: publicUser(row) })
})

app.delete('/members/:id', requireAuth, requireAdmin, async (c) => {
  const targetId = c.req.param('id') || ''
  if (targetId === c.get('me').id) return c.json({ error: 'you cannot revoke your own access' }, 400)
  const db = await getDb()
  const orgId = c.get('session').orgId
  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, targetId), eq(users.orgId, orgId)))
  if (!target) return c.json({ error: 'not found' }, 404)
  await db.delete(users).where(eq(users.id, targetId))
  return c.json({ ok: true })
})

// -------------------------------------------------------------- billing
app.route('/billing', billing)
