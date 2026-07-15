import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { and, eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { databaseUrl, getDb } from './db.js'
import { orgs, orgState, outreachCampaigns, outreachLeads, outreachSends, qboInvoices, users } from './schema.js'
import { billing } from './billing.js'
import { ACTORS, apifyConfigured, runActor } from './apify.js'
import { DEFAULT_TEMPLATE, renderEmail, resendConfigured, sendEmail } from './outreach.js'

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

type Env = {
  Variables: { session: SessionUser; me: typeof users.$inferSelect; org: typeof orgs.$inferSelect }
}

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

/** Board size included with each plan; absent = unlimited. */
const PLAN_MEMBER_LIMITS: Record<string, number> = { starter: 7 }

/**
 * The free preview is read-only: anyone can register, sign in, and look
 * around, but every write (board state, members) needs an active plan.
 * Auth, reads, and billing stay open so upgrading is always possible.
 */
async function requireActivePlan(c: Context<Env>, next: Next) {
  const db = await getDb()
  const [org] = await db.select().from(orgs).where(eq(orgs.id, c.get('session').orgId))
  if (!org || org.plan === 'none' || org.planStatus !== 'active') {
    return c.json(
      {
        error:
          'Your board is on the free preview — you can look around, but making changes needs an active plan. Choose a plan in Team & Access.',
        code: 'upgrade_required',
      },
      402,
    )
  }
  c.set('org', org)
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

/** Orgs go to the client without the Anthropic key — only a boolean. */
function publicOrg(o: typeof orgs.$inferSelect) {
  const { anthropicKey: _drop, ...rest } = o
  return { ...rest, aiConfigured: !!o.anthropicKey }
}

export const app = new Hono<Env>().basePath('/api')

app.get('/health', (c) =>
  c.json({
    ok: true,
    build: 5,
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
  return c.json({ org: publicOrg(org), me: publicUser(me) }, 201)
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
      return c.json({ org: publicOrg(org), me: publicUser({ ...u, status: 'active' }) })
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
  return c.json({ org: publicOrg(org), me: publicUser(c.get('me')) })
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

app.put('/state', requireAuth, requireActivePlan, async (c) => {
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

app.post('/members', requireAuth, requireAdmin, requireActivePlan, async (c) => {
  const body = await c.req.json().catch(() => null)
  const name = (body?.name || '').trim()
  const username = (body?.username || '').trim().toLowerCase()
  const email = (body?.email || '').trim().toLowerCase()
  const password = body?.password || ''
  if (!name || !username || !email) return c.json({ error: 'name, username, and email are required' }, 400)
  const db = await getDb()
  const orgId = c.get('session').orgId
  const existing = await db.select().from(users).where(eq(users.orgId, orgId))
  const limit = PLAN_MEMBER_LIMITS[c.get('org').plan]
  if (limit && existing.length >= limit) {
    return c.json(
      {
        error: `The Starter plan includes up to ${limit} board members. Upgrade to Growth for an unlimited board.`,
        code: 'member_limit',
      },
      402,
    )
  }
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

app.patch('/members/:id', requireAuth, requireAdmin, requireActivePlan, async (c) => {
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

app.delete('/members/:id', requireAuth, requireAdmin, requireActivePlan, async (c) => {
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

// ------------------------------------------------------------ AI drafting
/** Save (or clear, with an empty key) the org's Anthropic API key. */
app.post('/org/ai-key', requireAuth, requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const key = typeof body?.key === 'string' ? body.key.trim() : ''
  if (key && !key.startsWith('sk-ant-')) {
    return c.json({ error: 'That doesn’t look like an Anthropic API key — they start with sk-ant-.' }, 400)
  }
  const db = await getDb()
  await db.update(orgs).set({ anthropicKey: key || null }).where(eq(orgs.id, c.get('session').orgId))
  return c.json({ ok: true, aiConfigured: !!key })
})

/** Draft a formal board document with the org's own Anthropic key.
 *  The key never leaves the server; the client falls back to the built-in
 *  template when no key is configured. */
app.post('/ai/draft', requireAuth, requireActivePlan, async (c) => {
  const org = c.get('org')
  if (!org.anthropicKey) {
    return c.json(
      { error: 'Add your organization’s Anthropic API key in Team & Access to enable AI drafting.', code: 'no_ai_key' },
      400,
    )
  }
  const body = await c.req.json().catch(() => ({}))
  const motionTitle = String(body?.motionTitle || '').slice(0, 300)
  if (!motionTitle) return c.json({ error: 'motionTitle required' }, 400)
  const motionDesc = String(body?.motionDesc || '').slice(0, 2000)
  const meetingTitle = String(body?.meetingTitle || '').slice(0, 200)
  const db = await getDb()
  const roster = await db.select().from(users).where(eq(users.orgId, org.id))
  const signers = roster.map((u) => `- ${u.name}, ${u.roleTitle}`).join('\n')
  const prompt = [
    `Write a formal board resolution for ${org.name}, a nonprofit corporation, enacting this board motion:`,
    `Motion: ${motionTitle}`,
    motionDesc ? `Details: ${motionDesc}` : '',
    meetingTitle ? `Discussed at the meeting: "${meetingTitle}".` : '',
    '',
    'Structure: a centered-style heading with the organization name, a RECITALS section (WHEREAS clauses),',
    'a RESOLUTIONS section (RESOLVED clauses), an effective-date line with a blank to fill in, and a',
    'SIGNATURES OF THE DIRECTORS section listing each of these signers with a date blank:',
    signers,
    '',
    'Plain text only (no markdown). Do not invent facts not implied by the motion. Keep it under 500 words.',
    'Return ONLY the document text.',
  ].filter(Boolean).join('\n')
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': org.anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      console.error('anthropic draft failed:', res.status, (await res.text()).slice(0, 300))
      return c.json(
        {
          error:
            res.status === 401
              ? 'Your Anthropic API key was rejected — check it in Team & Access.'
              : 'The AI service had a problem — try again in a moment.',
        },
        502,
      )
    }
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text || '')
      .join('\n')
      .trim()
    if (!text) return c.json({ error: 'The AI returned an empty draft — try again.' }, 502)
    return c.json({ text })
  } catch (e) {
    console.error('anthropic draft unreachable:', e)
    return c.json({ error: 'Could not reach the AI service — try again.' }, 502)
  }
})

// ----------------------------------------------------- owner admin portal
/** These endpoints power app.quorumsuite.com/admin — the business owner's
 *  view across ALL organizations. Gated by the ADMIN_KEY secret, never by
 *  user sessions. Plan changes reuse POST /billing/activate (same key). */
const adminKeyOk = (c: Context) =>
  !!process.env.ADMIN_KEY && c.req.header('x-admin-key') === process.env.ADMIN_KEY

app.get('/admin/orgs', async (c) => {
  if (!adminKeyOk(c)) return c.json({ error: 'forbidden' }, 403)
  const db = await getDb()
  const [allOrgs, allUsers, states, invoices] = await Promise.all([
    db.select().from(orgs),
    db.select().from(users),
    db.select().from(orgState),
    db.select().from(qboInvoices),
  ])
  const rows = allOrgs
    .map((o) => {
      const members = allUsers.filter((u) => u.orgId === o.id)
      const admin = members.find((u) => u.isAdmin)
      const st = states.find((s) => s.orgId === o.id)
      const inv = invoices.filter((i) => i.orgId === o.id)
      return {
        id: o.id,
        name: o.name,
        createdAt: o.createdAt,
        plan: o.plan,
        planStatus: o.planStatus,
        aiConfigured: !!o.anthropicKey,
        members: members.length,
        adminName: admin?.name ?? '—',
        adminEmail: admin?.email ?? '—',
        stateVersion: st?.version ?? 0,
        lastActivity: st?.updatedAt ?? o.createdAt,
        openInvoices: inv.filter((i) => i.status === 'open').length,
        paidInvoices: inv.filter((i) => i.status === 'paid').length,
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return c.json({ orgs: rows })
})

app.delete('/admin/orgs/:id', async (c) => {
  if (!adminKeyOk(c)) return c.json({ error: 'forbidden' }, 403)
  const orgId = c.req.param('id') || ''
  const db = await getDb()
  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId))
  if (!org) return c.json({ error: 'org not found' }, 404)
  // FK cascades remove the org's users, state, and invoice records.
  await db.delete(orgs).where(eq(orgs.id, orgId))
  return c.json({ ok: true, deleted: orgId, name: org.name })
})

// --------------------------------------------------------- outreach CRM
/** Discover nonprofit leads via an Apify actor and upsert them (dedup by
 *  email). Actors that don't return emails still land as leads without one;
 *  run the email-finder actor over the same query to fill them in. */
app.post('/admin/outreach/discover', async (c) => {
  if (!adminKeyOk(c)) return c.json({ error: 'forbidden' }, 403)
  if (!apifyConfigured()) return c.json({ error: 'Set APIFY_TOKEN to enable discovery.', code: 'no_apify' }, 400)
  const body = await c.req.json().catch(() => ({}))
  const source = String(body?.source || '')
  if (!ACTORS[source]) return c.json({ error: 'unknown source actor' }, 400)
  let found
  try {
    found = await runActor(source, {
      query: String(body?.query || '').slice(0, 200),
      state: String(body?.state || '').slice(0, 40) || undefined,
      limit: Math.min(500, Math.max(1, Number(body?.limit) || 100)),
    })
  } catch (e) {
    console.error('apify discover failed:', e)
    return c.json({ error: 'Discovery run failed — check the actor input or your Apify plan.' }, 502)
  }
  const db = await getDb()
  const existing = await db.select().from(outreachLeads)
  const byEmail = new Map(existing.filter((l) => l.email).map((l) => [l.email.toLowerCase(), l]))
  let added = 0
  let withEmail = 0
  for (const item of found) {
    if (!item.email) continue // only store contactable leads
    withEmail++
    const email = item.email.toLowerCase()
    if (byEmail.has(email)) continue
    await db.insert(outreachLeads).values({
      id: id('lead_'),
      orgName: item.orgName,
      email,
      ein: item.ein,
      state: item.state,
      city: item.city,
      ntee: item.ntee,
      website: item.website,
      source,
      unsubToken: crypto.randomUUID().replace(/-/g, ''),
    })
    byEmail.set(email, {} as typeof existing[number])
    added++
  }
  return c.json({ found: found.length, withEmail, added, sourceLabel: ACTORS[source].label })
})

app.get('/admin/outreach/leads', async (c) => {
  if (!adminKeyOk(c)) return c.json({ error: 'forbidden' }, 403)
  const db = await getDb()
  const rows = await db.select().from(outreachLeads)
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const counts = rows.reduce<Record<string, number>>((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {})
  return c.json({
    leads: rows.map((l) => ({
      id: l.id, orgName: l.orgName, email: l.email, state: l.state, city: l.city,
      ntee: l.ntee, website: l.website, source: l.source, status: l.status,
      lastEmailedAt: l.lastEmailedAt, createdAt: l.createdAt,
    })),
    counts,
    actors: Object.entries(ACTORS).map(([key, a]) => ({ key, label: a.label, findsEmails: a.findsEmails })),
    apifyConfigured: apifyConfigured(),
    sendConfigured: resendConfigured(),
    template: DEFAULT_TEMPLATE,
  })
})

app.delete('/admin/outreach/leads/:id', async (c) => {
  if (!adminKeyOk(c)) return c.json({ error: 'forbidden' }, 403)
  const db = await getDb()
  await db.delete(outreachLeads).where(eq(outreachLeads.id, c.req.param('id') || ''))
  return c.json({ ok: true })
})

/** Send a campaign to the selected leads. Skips unsubscribed/bounced leads,
 *  renders per-lead unsubscribe + postal footer, records one send row each,
 *  and marks leads emailed. Dry-run (nothing delivered) until RESEND_API_KEY
 *  is set. */
app.post('/admin/outreach/send', async (c) => {
  if (!adminKeyOk(c)) return c.json({ error: 'forbidden' }, 403)
  const body = await c.req.json().catch(() => ({}))
  const subject = String(body?.subject || '').slice(0, 300)
  const bodyHtml = String(body?.body || '')
  const leadIds: string[] = Array.isArray(body?.leadIds) ? body.leadIds.map(String) : []
  if (!subject || !bodyHtml || leadIds.length === 0) {
    return c.json({ error: 'subject, body, and at least one lead are required' }, 400)
  }
  const db = await getDb()
  const all = await db.select().from(outreachLeads)
  const targets = all.filter((l) => leadIds.includes(l.id) && l.status !== 'unsubscribed' && l.status !== 'bounced')
  const campaignId = id('camp_')
  await db.insert(outreachCampaigns).values({ id: campaignId, subject, body: bodyHtml })
  let sent = 0
  let dryRun = 0
  let failed = 0
  for (const lead of targets) {
    const html = renderEmail(bodyHtml, lead)
    const subj = subject.split('{{orgName}}').join(lead.orgName).split('{{org}}').join(lead.orgName)
    const r = await sendEmail({ to: lead.email, subject: subj, html })
    await db.insert(outreachSends).values({
      id: id('send_'), campaignId, leadId: lead.id,
      status: r.dryRun ? 'dryrun' : r.ok ? 'sent' : 'failed', error: r.error ?? null,
    })
    if (r.ok) {
      await db.update(outreachLeads).set({ status: 'emailed', lastEmailedAt: new Date() }).where(eq(outreachLeads.id, lead.id))
      r.dryRun ? dryRun++ : sent++
    } else failed++
  }
  await db.update(outreachCampaigns).set({ sentCount: sent + dryRun }).where(eq(outreachCampaigns.id, campaignId))
  return c.json({
    campaignId, targeted: targets.length, sent, dryRun, failed,
    skipped: leadIds.length - targets.length,
    mode: resendConfigured() ? 'live' : 'dryrun',
  })
})

/** Public one-click unsubscribe (CAN-SPAM). No auth — the token is the proof. */
app.get('/outreach/unsubscribe', async (c) => {
  const token = c.req.query('token') || ''
  const html = (msg: string) =>
    c.html(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — Quorum</title><body style="font-family:system-ui,Arial,sans-serif;background:#faf4ed;color:#332b24;display:grid;place-items:center;min-height:100vh;margin:0"><div style="max-width:420px;text-align:center;padding:32px;background:#fffdf9;border:1px solid #efe5d8;border-radius:16px"><div style="font-size:30px">✓</div><h1 style="font-size:20px">${msg}</h1><p style="color:#8b8074;font-size:14px">Paragon Government Solutions LLC · Fairfax, VA</p></div></body>`)
  if (!token) return html('Invalid unsubscribe link.')
  const db = await getDb()
  const [lead] = await db.select().from(outreachLeads).where(eq(outreachLeads.unsubToken, token))
  if (!lead) return html('This link is no longer valid.')
  await db.update(outreachLeads).set({ status: 'unsubscribed' }).where(eq(outreachLeads.id, lead.id))
  return html("You’ve been unsubscribed. We won’t contact you again.")
})

// -------------------------------------------------------------- billing
app.route('/billing', billing)
