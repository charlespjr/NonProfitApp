/**
 * Stripe billing. Fully env-gated: without STRIPE_SECRET_KEY every endpoint
 * (except the plan read) answers 503 with a human explanation, so the app
 * works end-to-end before the Stripe account exists.
 *
 * Products to create in the Stripe dashboard (test mode first):
 *   - "Quorum Growth"        recurring monthly  → price id in STRIPE_PRICE_GROWTH
 *   - "Quorum Launch Partner" one-time          → price id in STRIPE_PRICE_LAUNCH
 * Webhook endpoint: POST <APP_URL>/api/billing/webhook
 *   events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted
 */
import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { and, eq } from 'drizzle-orm'
import { getDb } from './db'
import { orgs, users } from './schema'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'

type Env = { Variables: { orgId: string; isAdmin: boolean } }

async function requireAdminLite(c: Context<Env>, next: Next) {
  const token = getCookie(c, 'quorum_session')
  if (!token) return c.json({ error: 'unauthenticated' }, 401)
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    const db = await getDb()
    const [me] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, String(payload.sub)), eq(users.orgId, String(payload.org))))
    if (!me) return c.json({ error: 'unauthenticated' }, 401)
    if (!me.isAdmin) return c.json({ error: 'admin only' }, 403)
    c.set('orgId', me.orgId)
    c.set('isAdmin', true)
  } catch {
    return c.json({ error: 'unauthenticated' }, 401)
  }
  await next()
}

async function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const { default: Stripe } = await import('stripe')
  return new Stripe(key)
}

const NOT_CONFIGURED = {
  error: 'Billing is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_GROWTH, and STRIPE_PRICE_LAUNCH.',
}

export const billing = new Hono<Env>()

billing.get('/plan', requireAdminLite, async (c) => {
  const db = await getDb()
  const [org] = await db.select().from(orgs).where(eq(orgs.id, c.get('orgId')))
  return c.json({
    plan: org?.plan ?? 'none',
    planStatus: org?.planStatus ?? 'inactive',
    configured: !!process.env.STRIPE_SECRET_KEY,
  })
})

billing.post('/checkout', requireAdminLite, async (c) => {
  const stripe = await stripeClient()
  if (!stripe) return c.json(NOT_CONFIGURED, 503)
  const body = await c.req.json().catch(() => ({}))
  const tier: string = body?.tier === 'launch_partner' ? 'launch_partner' : 'growth'
  const appUrl = process.env.APP_URL || new URL(c.req.url).origin
  const db = await getDb()
  const orgId = c.get('orgId')
  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId))
  if (!org) return c.json({ error: 'org not found' }, 404)

  let customerId = org.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ name: org.name, metadata: { orgId } })
    customerId = customer.id
    await db.update(orgs).set({ stripeCustomerId: customerId }).where(eq(orgs.id, orgId))
  }

  const growthPrice = process.env.STRIPE_PRICE_GROWTH
  const launchPrice = process.env.STRIPE_PRICE_LAUNCH
  if (!growthPrice || (tier === 'launch_partner' && !launchPrice)) return c.json(NOT_CONFIGURED, 503)

  // Launch Partner = one-time fee + the Growth subscription in one checkout.
  const lineItems =
    tier === 'launch_partner'
      ? [
          { price: launchPrice!, quantity: 1 },
          { price: growthPrice, quantity: 1 },
        ]
      : [{ price: growthPrice, quantity: 1 }]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: lineItems,
    success_url: `${appUrl}/?billing=success`,
    cancel_url: `${appUrl}/?billing=canceled`,
    metadata: { orgId, tier },
    subscription_data: { metadata: { orgId, tier } },
  })
  return c.json({ url: session.url })
})

billing.post('/portal', requireAdminLite, async (c) => {
  const stripe = await stripeClient()
  if (!stripe) return c.json(NOT_CONFIGURED, 503)
  const db = await getDb()
  const [org] = await db.select().from(orgs).where(eq(orgs.id, c.get('orgId')))
  if (!org?.stripeCustomerId) return c.json({ error: 'no billing account yet — subscribe first' }, 400)
  const appUrl = process.env.APP_URL || new URL(c.req.url).origin
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${appUrl}/`,
  })
  return c.json({ url: session.url })
})

billing.post('/webhook', async (c) => {
  const stripe = await stripeClient()
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !whSecret) return c.json(NOT_CONFIGURED, 503)
  const sig = c.req.header('stripe-signature')
  const raw = await c.req.text()
  let event: import('stripe').default.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig || '', whSecret)
  } catch {
    return c.json({ error: 'bad signature' }, 400)
  }
  const db = await getDb()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orgId = session.metadata?.orgId
    const tier = session.metadata?.tier === 'launch_partner' ? 'launch_partner' : 'growth'
    if (orgId) {
      await db.update(orgs).set({ plan: tier, planStatus: 'active' }).where(eq(orgs.id, orgId))
    }
  } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const orgId = sub.metadata?.orgId
    if (orgId) {
      const status =
        event.type === 'customer.subscription.deleted'
          ? 'canceled'
          : sub.status === 'active' || sub.status === 'trialing'
            ? 'active'
            : sub.status === 'past_due'
              ? 'past_due'
              : 'inactive'
      const patch: Record<string, string> = { planStatus: status }
      if (status === 'canceled') patch.plan = 'none'
      await db.update(orgs).set(patch).where(eq(orgs.id, orgId))
    }
  }
  return c.json({ received: true })
})
