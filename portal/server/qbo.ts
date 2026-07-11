/**
 * QuickBooks Online integration (billing mode 'qbo').
 *
 * Env: QBO_CLIENT_ID, QBO_CLIENT_SECRET, QBO_REALM_ID, QBO_REFRESH_TOKEN
 * (seed only — Intuit rotates refresh tokens on every use, so the current
 * token lives in the qbo_tokens table), QBO_ENV ('production' | 'sandbox').
 *
 * Checkout: ensure a QBO Customer for the org → create an Invoice for the
 * matching Quorum service item with online card/ACH payment enabled → hand
 * the customer the invoice's hosted payment link. Sync: list our open
 * invoices, mark orgs active when QuickBooks reports Balance = 0.
 */
import { and, eq } from 'drizzle-orm'
import { getDb } from './db.js'
import { orgs, qboInvoices, qboTokens } from './schema.js'

const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

export interface QboPlan {
  itemName: string
  amount: string
}

/** Service items already created in the Paragon QBO catalog. */
export const QBO_PLANS: Record<string, QboPlan> = {
  'starter:monthly': { itemName: 'Quorum Starter (Monthly)', amount: '29.00' },
  'starter:yearly': { itemName: 'Quorum Starter (Yearly)', amount: '290.00' },
  'growth:monthly': { itemName: 'Quorum Growth (Monthly)', amount: '59.00' },
  'growth:yearly': { itemName: 'Quorum Growth (Yearly)', amount: '590.00' },
  'scale:monthly': { itemName: 'Quorum Scale (Monthly)', amount: '99.00' },
  'scale:yearly': { itemName: 'Quorum Scale (Yearly)', amount: '990.00' },
  'launch_partner:once': { itemName: 'Quorum Launch Partner', amount: '490.00' },
}

export function qboConfigured(): boolean {
  return !!(
    process.env.QBO_CLIENT_ID &&
    process.env.QBO_CLIENT_SECRET &&
    process.env.QBO_REALM_ID &&
    process.env.QBO_REFRESH_TOKEN
  )
}

function apiBase(): string {
  return process.env.QBO_ENV === 'sandbox'
    ? 'https://sandbox-quickbooks.api.intuit.com'
    : 'https://quickbooks.api.intuit.com'
}

const realm = () => process.env.QBO_REALM_ID!

// ------------------------------------------------------------------ tokens
async function loadRefreshToken(): Promise<string> {
  const db = await getDb()
  const [row] = await db.select().from(qboTokens).where(eq(qboTokens.realmId, realm()))
  return row?.refreshToken || process.env.QBO_REFRESH_TOKEN!
}

let accessTokenCache: { token: string; expires: number } | null = null

async function accessToken(): Promise<string> {
  if (accessTokenCache && Date.now() < accessTokenCache.expires - 60_000) {
    return accessTokenCache.token
  }
  const db = await getDb()
  const refresh = await loadRefreshToken()
  const basic = Buffer.from(`${process.env.QBO_CLIENT_ID}:${process.env.QBO_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      authorization: `Basic ${basic}`,
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  })
  if (!res.ok) {
    throw new Error(`QBO token refresh failed (${res.status}): ${await res.text()}`)
  }
  const body = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }
  // Persist the rotated refresh token — the old one may now be invalid.
  await db
    .insert(qboTokens)
    .values({
      realmId: realm(),
      refreshToken: body.refresh_token,
      accessToken: body.access_token,
      accessExpiresAt: new Date(Date.now() + body.expires_in * 1000),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: qboTokens.realmId,
      set: {
        refreshToken: body.refresh_token,
        accessToken: body.access_token,
        accessExpiresAt: new Date(Date.now() + body.expires_in * 1000),
        updatedAt: new Date(),
      },
    })
  accessTokenCache = { token: body.access_token, expires: Date.now() + body.expires_in * 1000 }
  return body.access_token
}

async function qboFetch(path: string, init?: RequestInit): Promise<any> {
  const token = await accessToken()
  const res = await fetch(`${apiBase()}/v3/company/${realm()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`QBO ${path} failed (${res.status}): ${await res.text()}`)
  return res.json()
}

const q = (query: string) => qboFetch(`/query?query=${encodeURIComponent(query)}&minorversion=75`)

// ---------------------------------------------------------------- entities
const itemIdCache = new Map<string, string>()

async function itemIdByName(name: string): Promise<string> {
  const hit = itemIdCache.get(name)
  if (hit) return hit
  const body = await q(`select Id from Item where Name = '${name.replace(/'/g, "\\'")}'`)
  const id = body?.QueryResponse?.Item?.[0]?.Id
  if (!id) throw new Error(`QBO item not found: ${name}`)
  itemIdCache.set(name, id)
  return id
}

async function ensureCustomer(orgId: string, orgName: string, email: string): Promise<string> {
  // Tag the QBO customer with our org id so lookups survive renames.
  const safe = orgName.replace(/[:']/g, '')
  const display = `${safe} [${orgId}]`
  const found = await q(`select Id from Customer where DisplayName = '${display}'`)
  const existing = found?.QueryResponse?.Customer?.[0]?.Id
  if (existing) return existing
  const created = await qboFetch('/customer?minorversion=75', {
    method: 'POST',
    body: JSON.stringify({
      DisplayName: display,
      CompanyName: safe,
      PrimaryEmailAddr: { Address: email },
    }),
  })
  return created.Customer.Id
}

async function readInvoice(id: string): Promise<any | null> {
  try {
    const body = await qboFetch(`/invoice/${id}?minorversion=75&include=invoiceLink`)
    return body?.Invoice ?? null
  } catch {
    return null
  }
}

export interface CheckoutInvoice {
  invoiceId: string
  payUrl: string
  amount: string
}

export async function createCheckoutInvoice(input: {
  orgId: string
  orgName: string
  adminEmail: string
  tier: string
  period: string
}): Promise<CheckoutInvoice> {
  const planKey = input.tier === 'launch_partner' ? 'launch_partner:once' : `${input.tier}:${input.period}`
  const plan = QBO_PLANS[planKey]
  if (!plan) throw new Error(`unknown plan ${planKey}`)
  const db0 = await getDb()
  // One open invoice per org: reuse an identical open invoice (double-click,
  // back-button, changed their mind and came back), void any other open
  // Quorum invoice so the QuickBooks pay page never stacks multiple charges.
  const openRows = await db0
    .select()
    .from(qboInvoices)
    .where(and(eq(qboInvoices.orgId, input.orgId), eq(qboInvoices.status, 'open')))
  for (const row of openRows) {
    const existing = await readInvoice(row.invoiceId)
    if (!existing) {
      await db0.update(qboInvoices).set({ status: 'void' }).where(eq(qboInvoices.invoiceId, row.invoiceId))
      continue
    }
    if (Number(existing.Balance) === 0) continue // paid — the sync will activate it
    const samePlan = row.tier === input.tier && row.period === input.period
    if (samePlan && existing.InvoiceLink) {
      return { invoiceId: row.invoiceId, payUrl: existing.InvoiceLink, amount: row.amount }
    }
    try {
      await qboFetch('/invoice?operation=void&minorversion=75', {
        method: 'POST',
        body: JSON.stringify({ Id: String(existing.Id), SyncToken: String(existing.SyncToken ?? '0') }),
      })
    } catch (e) {
      console.error('void of superseded invoice failed:', e)
    }
    await db0.update(qboInvoices).set({ status: 'void' }).where(eq(qboInvoices.invoiceId, row.invoiceId))
  }
  const customerId = await ensureCustomer(input.orgId, input.orgName, input.adminEmail)
  const itemId = await itemIdByName(plan.itemName)
  const created = await qboFetch('/invoice?minorversion=75&include=invoiceLink', {
    method: 'POST',
    body: JSON.stringify({
      CustomerRef: { value: customerId },
      BillEmail: { Address: input.adminEmail },
      AllowOnlineCreditCardPayment: true,
      AllowOnlineACHPayment: true,
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          Amount: Number(plan.amount),
          Description: `${plan.itemName} — ${input.orgName}`,
          SalesItemLineDetail: { ItemRef: { value: itemId }, Qty: 1 },
        },
      ],
      CustomerMemo: { value: `Quorum subscription for ${input.orgName}. Plan activates automatically once payment posts.` },
    }),
  })
  const inv = created.Invoice
  const payUrl: string | undefined = inv?.InvoiceLink
  if (!payUrl) throw new Error('QBO invoice created but no payment link returned — is QuickBooks Payments enabled?')
  const db = await getDb()
  await db.insert(qboInvoices).values({
    invoiceId: String(inv.Id),
    orgId: input.orgId,
    tier: input.tier,
    period: input.period,
    amount: plan.amount,
  })
  return { invoiceId: String(inv.Id), payUrl, amount: plan.amount }
}

/** Check our open invoices against QuickBooks; activate paid orgs.
 *  Returns a summary for logging/response. */
export async function syncPaidInvoices(): Promise<{ checked: number; activated: string[] }> {
  const db = await getDb()
  const open = await db.select().from(qboInvoices).where(eq(qboInvoices.status, 'open'))
  const activated: string[] = []
  for (const row of open) {
    const body = await q(`select Id, Balance from Invoice where Id = '${row.invoiceId}'`)
    const inv = body?.QueryResponse?.Invoice?.[0]
    if (!inv) continue
    if (Number(inv.Balance) === 0) {
      await db
        .update(qboInvoices)
        .set({ status: 'paid', paidAt: new Date() })
        .where(eq(qboInvoices.invoiceId, row.invoiceId))
      if (row.tier !== 'launch_partner') {
        await db
          .update(orgs)
          .set({ plan: row.tier, planStatus: 'active' })
          .where(eq(orgs.id, row.orgId))
      }
      activated.push(row.orgId)
    }
  }
  return { checked: open.length, activated }
}
