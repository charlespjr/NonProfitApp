/**
 * Apify integration for lead discovery. Runs one of the configured actors
 * synchronously, waits for the dataset, and normalizes items into leads.
 *
 * Env: APIFY_TOKEN. Without it, discovery answers "not configured".
 *
 * The six wired actors (owner's account):
 *   propublica  wO8XZnQ0QvkelrzCM  ProPublica Nonprofit Crawler (IRS 990)
 *   explorer    AGJVz4LZzmjeDkK8P  Nonprofit Explorer (IRS 990 search)
 *   irs990      dMeZqceVdmxNdL4dp  IRS 990 Scraper
 *   guidestar   kJUWFBFByp1O9XpP1  GuideStar / ProPublica Scraper
 *   wyoming     zaRytWJXTc9nCm7gY  Wyoming Business Entity Scraper
 *   emails      uX5AIhMeVCDRXN3h0  Charity Email Scraper (finds emails)
 */
export interface ActorDef {
  id: string
  label: string
  /** Builds the actor input from the console's simple {query, state} form. */
  buildInput: (q: { query?: string; state?: string; limit?: number }) => Record<string, unknown>
  findsEmails: boolean
}

export const ACTORS: Record<string, ActorDef> = {
  // input field names verified against each actor's published input schema
  emails: {
    id: 'uX5AIhMeVCDRXN3h0',
    label: 'Charity Email Scraper (finds emails)',
    buildInput: (q) => ({
      googleMapsSearchTerm: q.query?.trim() || 'nonprofit organization',
      googleMapsLocation: [q.state?.trim() || 'United States'],
      maxBusinesses: q.limit ?? 100,
      // Google Maps blocks datacenter IPs — residential proxy is required
      // or the scraper silently returns zero results.
      proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
    }),
    findsEmails: true,
  },
  propublica: {
    id: 'wO8XZnQ0QvkelrzCM',
    label: 'ProPublica Nonprofit Crawler (IRS 990)',
    buildInput: (q) => ({
      mode: 'search',
      searchTerm: q.query?.trim() || '',
      state: q.state?.trim() || '',
      includeFilings: false,
      maxItems: q.limit ?? 100,
    }),
    findsEmails: false,
  },
  explorer: {
    id: 'AGJVz4LZzmjeDkK8P',
    label: 'Nonprofit Explorer (IRS 990 search)',
    buildInput: (q) => ({
      query: q.query?.trim() || '',
      state: q.state?.trim() || '',
      maxResults: q.limit ?? 100,
      includeFilings: false,
    }),
    findsEmails: false,
  },
  irs990: {
    id: 'dMeZqceVdmxNdL4dp',
    label: 'IRS 990 Scraper',
    buildInput: (q) => ({
      searchType: 'search',
      query: q.query?.trim() || '',
      fetchDetails: false,
      maxResults: q.limit ?? 100,
    }),
    findsEmails: false,
  },
  guidestar: {
    id: 'kJUWFBFByp1O9XpP1',
    label: 'GuideStar / ProPublica Scraper',
    buildInput: (q) => ({
      searchQuery: q.query?.trim() || '',
      state: q.state?.trim() || '',
      maxItems: q.limit ?? 100,
    }),
    findsEmails: false,
  },
  wyoming: {
    id: 'zaRytWJXTc9nCm7gY',
    label: 'Wyoming Business Entity Scraper',
    buildInput: (q) => ({ filingName: q.query?.trim() || '', searchMode: 'contains', maxItems: q.limit ?? 100 }),
    findsEmails: false,
  },
  // Facebook email scrapers — most nonprofits have a page; keyword + location.
  fb_mind: {
    id: 'BZYFV9KlZT0gX13LA',
    label: 'Facebook Email Scraper — Mass (finds emails)',
    buildInput: (q) => ({
      keywords: [[q.query?.trim(), q.state?.trim()].filter(Boolean).join(' ') || 'nonprofit'],
      location: q.state?.trim() || '',
      platform: 'Facebook',
      maxEmails: q.limit ?? 100,
      proxyConfiguration: { useApifyProxy: true },
    }),
    findsEmails: true,
  },
  fb_best: {
    id: 'xt9dRXomhQkoDhQGp',
    label: 'Facebook Email Scraper — Best B2B/B2C (finds emails)',
    buildInput: (q) => ({
      keywords: [[q.query?.trim(), q.state?.trim()].filter(Boolean).join(' ') || 'nonprofit'],
      country: q.state?.trim() || 'United States',
      scrapeFrom: 'All',
      emailType: 'B2C',
      maxEmails: q.limit ?? 100,
    }),
    findsEmails: true,
  },
  fb_perfect: {
    id: 'i4B662uq8aosylSDD',
    label: 'Facebook Email Scraper — Perfectscrape (finds emails)',
    buildInput: (q) => ({
      keyword: [q.query?.trim(), q.state?.trim()].filter(Boolean).join(' ') || 'nonprofit',
      pagesToScrape: q.limit ?? 100,
      scrapeGmail: true,
      scrapeYahoo: true,
      scrapeOutlook: true,
      proxyConfiguration: { useApifyProxy: true },
    }),
    findsEmails: true,
  },
  fb_bhansali: {
    id: 'art7F0rZJYgNKVX5S',
    label: 'Facebook Email Scraper — Bhansali (finds emails)',
    buildInput: (q) => ({
      Keyword: [q.query?.trim(), q.state?.trim()].filter(Boolean).join(' ') || 'nonprofit',
      location: q.state?.trim() || '',
      social_network: 'facebook.com/',
      Country: 'www',
      Email_Type: '0',
      Limit: String(q.limit ?? 100),
      proxySettings: { useApifyProxy: true },
    }),
    findsEmails: true,
  },
}

export function apifyConfigured(): boolean {
  return !!(process.env.APIFY_TOKEN || process.env.APIFY_MOCK)
}

export interface NormalizedLead {
  orgName: string
  email: string | null
  ein: string | null
  state: string | null
  city: string | null
  ntee: string | null
  website: string | null
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
/** Placeholder/junk domains scrapers commonly emit — never real leads. */
const JUNK_DOMAINS = new Set([
  'mysite.com', 'example.com', 'example.org', 'example.net', 'domain.com', 'email.com',
  'yourdomain.com', 'test.com', 'sentry.io', 'wixpress.com', 'wix.com', 'sentry-next.wixpress.com',
  'godaddy.com', 'squarespace.com', 'no-reply.com', 'noreply.com', 'gstatic.com', 'schema.org',
  // SaaS/vendor addresses scraped from footers — not the organization itself
  'wildapricot.com', 'constantcontact.com', 'mailchimp.com', 'list-manage.com', 'sentry.wixpress.com',
  'donorbox.org', 'givebutter.com', 'classy.org', 'networkforgood.com', 'paypal.com', 'stripe.com',
  'facebook.com', 'wordpress.com', 'weebly.com', 'godaddysites.com', 'w3.org', 'googleapis.com',
])
function cleanEmail(s: string): string | null {
  const m = s.match(EMAIL_RE)
  if (!m) return null
  const email = m[0].toLowerCase()
  const domain = email.split('@')[1]
  if (JUNK_DOMAINS.has(domain)) return null
  if (/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i.test(email)) return null // asset paths
  return email
}
const firstEmail = (v: unknown): string | null => {
  if (Array.isArray(v)) { for (const x of v) { const e = firstEmail(x); if (e) return e } return null }
  if (typeof v === 'string') return cleanEmail(v)
  if (v && typeof v === 'object') return cleanEmail(String((v as { email?: unknown }).email ?? ''))
  return null
}
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** Any email hiding in a string value of the item, whatever the key. */
function scanForEmail(raw: Record<string, unknown>): string | null {
  for (const v of Object.values(raw)) {
    if (typeof v === 'string') { const e = cleanEmail(v); if (e) return e }
    else if (Array.isArray(v)) { const e = firstEmail(v); if (e) return e }
  }
  return null
}

/** Map a raw dataset item (shapes vary per actor) into our lead fields. */
export function normalizeItem(raw: Record<string, unknown>): NormalizedLead {
  const email =
    firstEmail(raw.email_found) || firstEmail(raw.email) || firstEmail(raw.emails) ||
    firstEmail(raw.contactEmail) || firstEmail(raw.emailAddress) || firstEmail(raw.Email) ||
    scanForEmail(raw)
  const website = str(raw.website) || str(raw.url) || str(raw.domain) || str(raw.profileUrl) || null
  let orgName =
    str(raw.orgName) || str(raw.name) || str(raw.organization) || str(raw.title) ||
    str(raw.pageName) || str(raw.businessName) || str(raw.fullName) ||
    str((raw.organization as Record<string, unknown>)?.name) || null
  // Fall back to the website/email domain so a lead is never nameless.
  if (!orgName && website) orgName = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  if (!orgName && email) orgName = email.split('@')[1]
  return {
    orgName: orgName || 'Unknown organization',
    email,
    ein: str(raw.ein) || str(raw.EIN) || null,
    state: str(raw.state) || str(raw.stateCode) || str(raw.location) || null,
    city: str(raw.city) || null,
    ntee: str(raw.ntee) || str(raw.nteeCode) || str(raw.category) || null,
    website,
  }
}

/** Run an actor and return its dataset items. Throws on failure so the
 *  endpoint can report a clean error. Uses the run-sync-get-dataset-items
 *  endpoint with a generous timeout. */
export async function runActor(
  actorKey: string,
  query: { query?: string; state?: string; limit?: number },
): Promise<NormalizedLead[]> {
  const def = ACTORS[actorKey]
  if (!def) throw new Error(`unknown actor ${actorKey}`)
  // Test seam: APIFY_MOCK holds a JSON array of raw items, returned instead
  // of calling the network. Never set in production.
  if (process.env.APIFY_MOCK) {
    const items = JSON.parse(process.env.APIFY_MOCK) as Array<Record<string, unknown>>
    return items.map(normalizeItem)
  }
  const token = process.env.APIFY_TOKEN
  if (!token) throw new Error('APIFY_TOKEN not set')
  // 280s run cap — the email scraper (Google Maps + proxy) is slow; still
  // under Vercel's function limit. Errors surface with the actor's message.
  const url = `https://api.apify.com/v2/acts/${def.id}/run-sync-get-dataset-items?token=${token}&timeout=280&format=json`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(def.buildInput(query)),
  })
  if (!res.ok) throw new Error(`Apify actor failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
  const items = (await res.json()) as Array<Record<string, unknown>>
  if (!Array.isArray(items)) return []
  lastRawSample = items.slice(0, 2)
  return items.map(normalizeItem)
}

/** Raw sample of the last run's first items — admin debug only. */
export let lastRawSample: unknown[] = []
