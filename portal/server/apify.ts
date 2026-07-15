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

const firstEmail = (v: unknown): string | null => {
  if (Array.isArray(v)) return firstEmail(v[0])
  if (typeof v === 'string') {
    const m = v.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
    return m ? m[0].toLowerCase() : null
  }
  return null
}
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** Map a raw dataset item (shapes vary per actor) into our lead fields. */
export function normalizeItem(raw: Record<string, unknown>): NormalizedLead {
  return {
    orgName:
      str(raw.orgName) || str(raw.name) || str(raw.organization) || str(raw.title) ||
      str((raw.organization as Record<string, unknown>)?.name) || 'Unknown organization',
    email:
      firstEmail(raw.email) || firstEmail(raw.emails) || firstEmail(raw.contactEmail) ||
      firstEmail(raw.emailAddress) || null,
    ein: str(raw.ein) || str(raw.EIN) || null,
    state: str(raw.state) || str(raw.stateCode) || str(raw.location) || null,
    city: str(raw.city) || null,
    ntee: str(raw.ntee) || str(raw.nteeCode) || str(raw.category) || null,
    website: str(raw.website) || str(raw.url) || str(raw.domain) || null,
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
  return items.map(normalizeItem)
}
