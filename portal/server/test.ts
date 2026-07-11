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

  // 13. tenant isolation: a second org cannot see the first org's data
  res = await app.request('/api/auth/register', json({
    orgName: 'Other Foundation', name: 'Sam Lee', email: 'sam@other.org', username: 'sam', password: 'password-99',
  }))
  const sam = cookieOf(res)
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

  // 15. billing unconfigured behaves gracefully
  res = await app.request('/api/billing/plan', { headers: { cookie: admin } })
  const plan = (await j(res)) as { plan?: string; configured?: boolean }
  check('billing plan readable, unconfigured', res.status === 200 && plan.plan === 'none' && plan.configured === false)
  res = await app.request('/api/billing/checkout', json({ tier: 'growth' }, admin))
  check('checkout without Stripe → 503', res.status === 503)
  res = await app.request('/api/billing/checkout', json({ tier: 'growth' }, judyCookie))
  check('checkout as non-admin → 403', res.status === 403)

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
