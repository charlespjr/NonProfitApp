/**
 * Server API tests — run with `npm run test:server`.
 * Uses the embedded PGlite database; no external services required.
 */
import { app } from './app.js'

let failures = 0
function check(name: string, cond: boolean, extra?: unknown) {
  console.log((cond ? 'PASS' : 'FAIL') + ' — ' + name + (cond ? '' : '  ' + JSON.stringify(extra ?? '')))
  if (!cond) failures++
}

const j = (res: Response): Promise<any> => res.json() as Promise<any>

function cookieOf(res: Response): string {
  return (res.headers.get('set-cookie') || '').split(';')[0]
}

const json = (body: unknown, cookie?: string): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
  body: JSON.stringify(body),
})

async function main() {
  process.env.ADMIN_KEY = 'test-admin-key'
  const activate = (orgId: string, plan: string) =>
    app.request('/api/billing/activate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-key': 'test-admin-key' },
      body: JSON.stringify({ orgId, plan }),
    })

  // 1. unauthenticated is rejected
  let res = await app.request('/api/state')
  check('unauthenticated /state → 401', res.status === 401)

  // 2. register an org
  res = await app.request('/api/auth/register', json({
    orgName: 'Adams Infinite Legacy',
    name: 'Alitalia Adams',
    email: 'alitalia.adams@gmail.com',
    username: 'alitalia',
    password: 'correct-horse-9',
  }))
  check('register → 201', res.status === 201, await res.clone().text())
  const admin = cookieOf(res)
  const reg = await j(res)
  check('register returns org + admin', reg.org?.name === 'Adams Infinite Legacy' && reg.me?.isAdmin === true)
  check('no password hash leaks', !('passwordHash' in (reg.me || {})))

  // 3. weak password rejected
  res = await app.request('/api/auth/register', json({ orgName: 'X', name: 'Y', email: 'y@x.com', username: 'y', password: 'short' }))
  check('weak password → 400', res.status === 400)

  // 4. me
  res = await app.request('/api/auth/me', { headers: { cookie: admin } })
  check('/auth/me works', res.status === 200 && (await j(res)).me.username === 'alitalia')

  // 5. login with wrong password fails
  res = await app.request('/api/auth/login', json({ identifier: 'alitalia', password: 'wrong' }))
  check('bad login → 401', res.status === 401)

  // 6. login with email works
  res = await app.request('/api/auth/login', json({ identifier: 'ALITALIA.ADAMS@GMAIL.COM', password: 'correct-horse-9' }))
  check('email login (case-insensitive) → 200', res.status === 200)

  // 6b. free preview is read-only: every write is 402 until a plan is active
  res = await app.request('/api/state', { ...json({ data: { tasks: {} }, version: 0 }, admin), method: 'PUT' })
  const gated = await j(res)
  check('unpaid PUT /state → 402 upgrade_required', res.status === 402 && gated.code === 'upgrade_required', gated)
  res = await app.request('/api/members', json({ name: 'Too Early', username: 'early', email: 'early@x.com' }, admin))
  check('unpaid invite member → 402', res.status === 402)
  res = await activate(reg.org.id, 'growth')
  check('activate org (growth) via admin key', res.status === 200)

  // 7. state starts empty, PUT bumps version, stale version conflicts
  res = await app.request('/api/state', { headers: { cookie: admin } })
  const s0 = await j(res)
  check('state starts empty at v0', res.status === 200 && s0.version === 0)
  res = await app.request('/api/state', { ...json({ data: { tasks: { articles: true } }, version: 0 }, admin), method: 'PUT' })
  check('state PUT → v1', res.status === 200 && (await j(res)).version === 1)
  res = await app.request('/api/state', { ...json({ data: { tasks: {} }, version: 0 }, admin), method: 'PUT' })
  check('stale PUT → 409', res.status === 409)

  // 8. invite a member
  res = await app.request('/api/members', json({
    name: 'Judy Adams', username: 'judy.adams', email: 'judyadams54@gmail.com',
    roleTitle: 'Vice Chair', password: 'temp-pass-123', canVote: true, canSign: false,
  }, admin))
  check('invite member → 201', res.status === 201, await res.clone().text())
  const judy = (await j(res)).member
  check('member invited status + mustChangePassword', judy.status === 'invited' && judy.mustChangePassword === true)

  // 9. duplicate username rejected
  res = await app.request('/api/members', json({ name: 'Dup', username: 'judy.adams', email: 'other@x.com' }, admin))
  check('duplicate username → 409', res.status === 409)

  // 10. member can log in, becomes active, is not admin
  res = await app.request('/api/auth/login', json({ identifier: 'judy.adams', password: 'temp-pass-123' }))
  check('member login → 200', res.status === 200)
  const judyCookie = cookieOf(res)
  const judyLogin = await j(res)
  check('member is active non-admin', judyLogin.me.status === 'active' && judyLogin.me.isAdmin === false)

  // 11. member sees org state but cannot manage members
  res = await app.request('/api/state', { headers: { cookie: judyCookie } })
  check('member reads org state (shared tenant)', res.status === 200 && (await j(res)).version === 1)
  res = await app.request('/api/members', json({ name: 'Sneaky', username: 'sneak', email: 's@x.com' }, judyCookie))
  check('member cannot invite → 403', res.status === 403)

  // 12. member changes their temp password
  res = await app.request('/api/auth/change-password', json({ password: 'my-new-pass-1' }, judyCookie))
  check('change password → 200', res.status === 200)
  res = await app.request('/api/auth/login', json({ identifier: 'judy.adams', password: 'my-new-pass-1' }))
  check('new password works', res.status === 200)

  // 12b. AI drafting key: validated, admin-only, never echoed back
  res = await app.request('/api/org/ai-key', json({ key: 'not-a-key' }, admin))
  check('malformed anthropic key → 400', res.status === 400)
  res = await app.request('/api/org/ai-key', json({ key: 'sk-ant-api03-test-key' }, judyCookie))
  check('non-admin cannot set ai key → 403', res.status === 403)
  res = await app.request('/api/ai/draft', json({ motionTitle: 'Adopt budget' }, admin))
  const noKey = await j(res)
  check('draft without key → 400 no_ai_key', res.status === 400 && noKey.code === 'no_ai_key', noKey)
  res = await app.request('/api/org/ai-key', json({ key: 'sk-ant-api03-test-key' }, admin))
  check('ai key saved', res.status === 200 && (await j(res)).aiConfigured === true)
  res = await app.request('/api/auth/me', { headers: { cookie: admin } })
  const meAi = await j(res)
  check('key never leaks to clients; only aiConfigured', meAi.org.aiConfigured === true && !('anthropicKey' in meAi.org), meAi.org)
  res = await app.request('/api/org/ai-key', json({ key: '' }, admin))
  check('ai key removable', res.status === 200 && (await j(res)).aiConfigured === false)

  // 13. tenant isolation: a second org cannot see the first org's data
  res = await app.request('/api/auth/register', json({
    orgName: 'Other Foundation', name: 'Sam Lee', email: 'sam@other.org', username: 'sam', password: 'password-99',
  }))
  const sam = cookieOf(res)
  const samOrgId = (await j(res)).org.id as string
  // Starter plan: writes allowed, board capped at 7 members.
  await activate(samOrgId, 'starter')
  res = await app.request('/api/state', { headers: { cookie: sam } })
  const samState = await j(res)
  check('second org state isolated (v0, empty)', samState.version === 0 && !samState.data?.tasks)
  res = await app.request('/api/members', { headers: { cookie: sam } })
  const samMembers = (await j(res)).members
  check('second org sees only its own member', samMembers.length === 1 && samMembers[0].username === 'sam')

  // 14. same username in two orgs both log in via password disambiguation
  res = await app.request('/api/members', json({ name: 'Alitalia Clone', username: 'alitalia', email: 'clone@other.org', password: 'clone-pass-77' }, sam))
  check('same username allowed in different org', res.status === 201)
  res = await app.request('/api/auth/login', json({ identifier: 'alitalia', password: 'clone-pass-77' }))
  const crossOrg = (await j(res)) as { org?: { name?: string } }
  check('cross-org username disambiguated by password', res.status === 200 && crossOrg.org?.name === 'Other Foundation')

  // 14b. Starter caps the board at 7 members; Growth lifts the cap
  for (let i = 0; i < 5; i++) {
    res = await app.request('/api/members', json({ name: 'Member ' + i, username: 'm' + i, email: 'm' + i + '@other.org' }, sam))
  }
  check('starter allows up to 7 members', res.status === 201, await res.clone().text())
  res = await app.request('/api/members', json({ name: 'One Too Many', username: 'm8', email: 'm8@other.org' }, sam))
  const capped = await j(res)
  check('8th member on starter → 402 member_limit', res.status === 402 && capped.code === 'member_limit', capped)
  await activate(samOrgId, 'growth')
  res = await app.request('/api/members', json({ name: 'Eighth Fine', username: 'm8', email: 'm8@other.org' }, sam))
  check('growth lifts the member cap', res.status === 201)

  // 15. billing unconfigured behaves gracefully
  res = await app.request('/api/billing/plan', { headers: { cookie: admin } })
  const plan = (await j(res)) as { plan?: string; configured?: boolean }
  check('billing plan readable, unconfigured', res.status === 200 && plan.plan === 'growth' && plan.configured === false)
  res = await app.request('/api/billing/checkout', json({ tier: 'growth' }, admin))
  check('checkout without Stripe → 503', res.status === 503)
  res = await app.request('/api/billing/checkout', json({ tier: 'growth' }, judyCookie))
  check('checkout as non-admin → 403', res.status === 403)


  // 15b. QuickBooks API billing: checkout, reuse, supersede, sync-activate
  process.env.QBO_CLIENT_ID = 'cid'
  process.env.QBO_CLIENT_SECRET = 'csecret'
  process.env.QBO_REALM_ID = '9341'
  process.env.QBO_REFRESH_TOKEN = 'seed-rt'
  process.env.ADMIN_KEY = 'test-admin-key'
  const realFetch = globalThis.fetch
  const qboCalls: string[] = []
  const voided: string[] = []
  let createSeq = 0
  let lastInvoiceLines: Array<{ Amount: number }> = []
  const invoices: Record<string, { Balance: number }> = {}
  globalThis.fetch = (async (input: any, init?: any) => {
    const url = String(input)
    if (!url.includes('intuit.com')) return realFetch(input, init)
    const method = init?.method || 'GET'
    qboCalls.push(method + ' ' + url.split('?')[0])
    const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
    if (url.includes('oauth.platform.intuit.com')) return ok({ access_token: 'at1', refresh_token: 'rt2', expires_in: 3600 })
    if (url.includes('/query')) {
      const query = decodeURIComponent(url.split('query=')[1].split('&')[0])
      if (query.includes('from Item')) return ok({ QueryResponse: { Item: [{ Id: '67' }] } })
      if (query.includes('from Customer')) return ok({ QueryResponse: {} })
      if (query.includes('from Invoice')) {
        const m = query.match(/Id = '([^']+)'/)
        const inv = m && invoices[m[1]]
        return ok({ QueryResponse: { Invoice: inv ? [{ Id: m![1], Balance: inv.Balance }] : [] } })
      }
      return ok({ QueryResponse: {} })
    }
    if (url.includes('/customer')) return ok({ Customer: { Id: 'C1' } })
    if (url.includes('operation=void')) {
      const id = JSON.parse(init.body).Id
      voided.push(id)
      delete invoices[id]
      return ok({ Invoice: { Id: id } })
    }
    const readMatch = url.match(/\/invoice\/([A-Za-z0-9]+)\?/)
    if (readMatch && method === 'GET') {
      const inv = invoices[readMatch[1]]
      if (!inv) return new Response('nope', { status: 404 })
      return ok({ Invoice: { Id: readMatch[1], Balance: inv.Balance, SyncToken: '0', InvoiceLink: 'https://pay.example/' + readMatch[1].toLowerCase() } })
    }
    if (url.includes('/invoice') && method === 'POST') {
      const id = 'INV' + ++createSeq
      lastInvoiceLines = JSON.parse(init.body).Line
      invoices[id] = { Balance: 59 }
      return ok({ Invoice: { Id: id, InvoiceLink: 'https://pay.example/' + id.toLowerCase() } })
    }
    return ok({})
  }) as typeof fetch

  res = await app.request('/api/billing/plan', { headers: { cookie: admin } })
  const qboPlanRes = (await j(res)) as { mode?: string }
  check('billing mode switches to qbo', qboPlanRes.mode === 'qbo')
  res = await app.request('/api/billing/checkout', json({ tier: 'growth', period: 'monthly' }, admin))
  const co1 = await j(res)
  check('qbo checkout returns invoice pay link', res.status === 200 && co1.url === 'https://pay.example/inv1' && co1.invoiceId === 'INV1', co1)
  check('qbo flow called token + customer + invoice APIs',
    qboCalls.some((x) => x.includes('oauth.platform')) &&
    qboCalls.some((x) => x.includes('/customer')) &&
    qboCalls.some((x) => x.includes('/invoice')))

  // clicking the same plan again must NOT create a second invoice
  res = await app.request('/api/billing/checkout', json({ tier: 'growth', period: 'monthly' }, admin))
  const co2 = await j(res)
  check('same-plan re-checkout reuses the open invoice', co2.invoiceId === 'INV1' && createSeq === 1, co2)

  // switching plans must void the old invoice and create exactly one new one
  res = await app.request('/api/billing/checkout', json({ tier: 'scale', period: 'yearly' }, admin))
  const co3 = await j(res)
  check('plan switch voids old invoice and creates new', co3.invoiceId === 'INV2' && voided.includes('INV1'), { co3, voided })

  // payment: INV2 goes to zero balance → sync activates the org on scale
  invoices['INV2'].Balance = 0
  res = await app.request('/api/billing/sync', { headers: { 'x-admin-key': 'test-admin-key' } })
  const sync = await j(res)
  check('sync marks invoice paid and activates org', res.status === 200 && Array.isArray(sync.activated) && sync.activated.length === 1, sync)
  res = await app.request('/api/billing/plan', { headers: { cookie: admin } })
  const planAfter = (await j(res)) as { plan?: string; planStatus?: string }
  check('org plan active after payment (scale)', planAfter.plan === 'scale' && planAfter.planStatus === 'active', planAfter)
  // Launch Partner: one invoice bundling the $599 setup fee + the Growth
  // subscription; paying it lands the org on the recurring Growth plan.
  res = await app.request('/api/billing/checkout', json({ tier: 'launch_partner', period: 'monthly' }, admin))
  const coLp = await j(res)
  check('launch partner checkout creates invoice', res.status === 200 && !!coLp.invoiceId, coLp)
  check(
    'launch partner invoice bundles setup + Growth ($748)',
    lastInvoiceLines.length === 2 && lastInvoiceLines.reduce((s, l) => s + l.Amount, 0) === 748,
    lastInvoiceLines,
  )
  invoices[coLp.invoiceId].Balance = 0
  res = await app.request('/api/billing/sync', { headers: { 'x-admin-key': 'test-admin-key' } })
  await j(res)
  res = await app.request('/api/billing/plan', { headers: { cookie: admin } })
  const planLp = (await j(res)) as { plan?: string; planStatus?: string }
  check('paid launch partner lands the org on Growth', planLp.plan === 'growth' && planLp.planStatus === 'active', planLp)

  res = await app.request('/api/billing/sync', {})
  check('sync without auth -> 403', res.status === 403)
  globalThis.fetch = realFetch
  delete process.env.QBO_CLIENT_ID
  delete process.env.QBO_CLIENT_SECRET
  delete process.env.QBO_REALM_ID
  delete process.env.QBO_REFRESH_TOKEN

  // 15c. owner admin endpoints: list all orgs, delete an org (ADMIN_KEY only)
  res = await app.request('/api/admin/orgs')
  check('admin list without key → 403', res.status === 403)
  res = await app.request('/api/admin/orgs', { headers: { 'x-admin-key': 'test-admin-key' } })
  const adminList = (await j(res)) as { orgs: Array<{ id: string; name: string; members: number; adminEmail: string; plan: string }> }
  check('admin list returns all orgs with rollups', res.status === 200 && adminList.orgs.length >= 2, adminList.orgs?.length)
  const ail = adminList.orgs.find((o) => o.name === 'Adams Infinite Legacy')
  check('admin rollup has members + admin email + plan', !!ail && ail.members >= 2 && ail.adminEmail === 'alitalia.adams@gmail.com' && ail.plan === 'growth', ail)
  // delete a throwaway org and confirm its logins die with it
  res = await app.request('/api/auth/register', json({ orgName: 'Delete Me Org', name: 'Del Me', email: 'del@me.org', username: 'delme', password: 'delete-me-99' }))
  const delCookie = cookieOf(res)
  const delOrgId = ((await j(res)) as { org: { id: string } }).org.id
  res = await app.request('/api/admin/orgs/' + delOrgId, { method: 'DELETE' })
  check('admin delete without key → 403', res.status === 403)
  res = await app.request('/api/admin/orgs/' + delOrgId, { method: 'DELETE', headers: { 'x-admin-key': 'test-admin-key' } })
  check('admin delete org → 200', res.status === 200)
  res = await app.request('/api/auth/me', { headers: { cookie: delCookie } })
  check('deleted org’s sessions invalid → 401', res.status === 401)

  // 15d. outreach CRM: discovery (mocked Apify) → dedup → dry-run send → unsubscribe
  process.env.APIFY_TOKEN = 'apify-test'
  const realFetch2 = globalThis.fetch
  globalThis.fetch = (async (input: any, init?: any) => {
    const url = String(input)
    if (url.includes('api.apify.com')) {
      return new Response(JSON.stringify([
        { name: 'Green Valley Food Bank', email: 'info@greenvalley.org', state: 'CA', city: 'Fresno', ntee: 'Food' },
        { name: 'Riverside Arts', emails: ['hello@riversidearts.org'], state: 'CA' },
        { name: 'No Email Org', state: 'TX' }, // dropped (no email)
        { organization: { name: 'Dup Org' }, email: 'INFO@greenvalley.org' }, // dedup (case-insensitive)
      ]), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return realFetch2(input, init)
  }) as typeof fetch

  res = await app.request('/api/admin/outreach/discover', json({ source: 'emails', query: 'food bank', state: 'CA' }, undefined))
  check('outreach discover without key → 403', res.status === 403)
  res = await app.request('/api/admin/outreach/discover', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': 'test-admin-key' },
    body: JSON.stringify({ source: 'emails', query: 'food bank', state: 'CA' }),
  })
  const disc = await j(res)
  check('discover ingests emailed leads, dedups, drops no-email', res.status === 200 && disc.added === 2 && disc.withEmail === 3, disc)

  res = await app.request('/api/admin/outreach/leads', { headers: { 'x-admin-key': 'test-admin-key' } })
  const leadsResp = await j(res)
  check('leads list returns actors + send flags', Array.isArray(leadsResp.leads) && leadsResp.leads.length === 2 && leadsResp.actors.length === 6, leadsResp.leads?.length)
  const gv = leadsResp.leads.find((l: any) => l.email === 'info@greenvalley.org')
  const rv = leadsResp.leads.find((l: any) => l.email === 'hello@riversidearts.org')

  // dry-run send (no RESEND_API_KEY): recorded, nothing delivered, leads marked emailed
  res = await app.request('/api/admin/outreach/send', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': 'test-admin-key' },
    body: JSON.stringify({ subject: 'Hi {{orgName}}', body: '<p>Hello {{orgName}}</p>', leadIds: [gv.id, rv.id] }),
  })
  const sendRes = await j(res)
  check('dry-run send targets both, mode dryrun', res.status === 200 && sendRes.targeted === 2 && sendRes.dryRun === 2 && sendRes.mode === 'dryrun', sendRes)

  // unsubscribe (public, token-gated) suppresses the lead
  const { getDb: getDbFn } = await import('./db.js')
  const { outreachLeads } = await import('./schema.js')
  const dbx = await getDbFn()
  const [{ unsubToken }] = await dbx.select().from(outreachLeads)
  res = await app.request('/api/outreach/unsubscribe?token=' + unsubToken)
  check('unsubscribe page returns 200', res.status === 200)
  res = await app.request('/api/admin/outreach/leads', { headers: { 'x-admin-key': 'test-admin-key' } })
  const afterUnsub = await j(res)
  check('unsubscribed lead is suppressed', afterUnsub.counts.unsubscribed === 1, afterUnsub.counts)

  // a send that includes the unsubscribed lead skips it
  res = await app.request('/api/admin/outreach/send', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': 'test-admin-key' },
    body: JSON.stringify({ subject: 'Round 2', body: '<p>Hi</p>', leadIds: [gv.id, rv.id] }),
  })
  const send2 = await j(res)
  check('send skips unsubscribed leads', send2.skipped >= 1 && send2.targeted < 2, send2)

  // 15e. daily drip: config, cron-auth, batch cap, honors active flag
  // add a few fresh 'new' leads via discovery so the drip has a queue
  globalThis.fetch = (async (input: any, init?: any) => {
    const url = String(input)
    if (url.includes('api.apify.com')) return new Response(JSON.stringify([
      { name: 'Drip Org 1', email: 'd1@ex.org' }, { name: 'Drip Org 2', email: 'd2@ex.org' }, { name: 'Drip Org 3', email: 'd3@ex.org' },
    ]), { status: 200, headers: { 'content-type': 'application/json' } })
    return realFetch2(input, init)
  }) as typeof fetch
  await app.request('/api/admin/outreach/discover', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': 'test-admin-key' }, body: JSON.stringify({ source: 'emails', query: 'x' }) })

  res = await app.request('/api/outreach/drip-run', { method: 'POST' })
  check('drip-run without auth → 403', res.status === 403)
  res = await app.request('/api/outreach/drip-run', { method: 'POST', headers: { 'x-admin-key': 'test-admin-key' } })
  check('drip-run when inactive → skipped', (await j(res)).skipped === 'drip not active')
  res = await app.request('/api/admin/outreach/drip', json({ subject: 'Hi {{orgName}}', body: '<p>hey</p>', dailyCap: 2, active: true }, undefined))
  check('drip save without key → 403', res.status === 403)
  res = await app.request('/api/admin/outreach/drip', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': 'test-admin-key' }, body: JSON.stringify({ subject: 'Hi {{orgName}}', body: '<p>hey</p>', dailyCap: 2, active: true }) })
  check('drip activated', res.status === 200 && (await j(res)).active === true)
  res = await app.request('/api/outreach/drip-run', { method: 'POST', headers: { 'x-admin-key': 'test-admin-key' } })
  const drip1 = await j(res)
  check('drip sends only dailyCap (2) leaves remainder', drip1.ran === 2 && drip1.remaining === 1, drip1)
  res = await app.request('/api/outreach/drip-run', { method: 'POST', headers: { 'x-admin-key': 'test-admin-key' } })
  const drip2 = await j(res)
  check('next drip run sends the last queued lead', drip2.ran === 1 && drip2.remaining === 0, drip2)
  res = await app.request('/api/outreach/drip-run', { method: 'POST', headers: { 'x-admin-key': 'test-admin-key' } })
  check('drip run with empty queue → 0', (await j(res)).ran === 0)
  process.env.CRON_SECRET = 'cron-test'
  res = await app.request('/api/outreach/drip-run', { headers: { authorization: 'Bearer cron-test' } })
  check('cron bearer authorizes drip', res.status === 200)
  delete process.env.CRON_SECRET

  globalThis.fetch = realFetch2
  delete process.env.APIFY_TOKEN

  // 16. revoke member
  res = await app.request('/api/members/' + judy.id, { method: 'DELETE', headers: { cookie: admin } })
  check('revoke member → 200', res.status === 200)
  res = await app.request('/api/auth/me', { headers: { cookie: judyCookie } })
  check('revoked member session invalid → 401', res.status === 401)

  // 17. logout clears session
  res = await app.request('/api/auth/logout', { method: 'POST', headers: { cookie: admin } })
  check('logout ok', res.status === 200)

  console.log(failures === 0 ? 'ALL SERVER TESTS PASSED' : failures + ' TESTS FAILED')
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
