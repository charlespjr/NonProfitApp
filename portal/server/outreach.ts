/**
 * Outreach sending + CAN-SPAM compliance.
 *
 * Env: RESEND_API_KEY (real send), OUTREACH_FROM (e.g. "Quorum <hello@quorumsuite.com>"),
 *      APP_URL (for the unsubscribe link). Without RESEND_API_KEY every send
 *      is a dry-run — recorded, nothing delivered — so the whole workflow is
 *      usable before the sending domain is verified.
 *
 * CAN-SPAM: every email gets a one-click unsubscribe link (per-lead token),
 * a physical mailing address, and honest sender identity. Unsubscribes are
 * honored immediately and permanently via the suppression status.
 */
const POSTAL = 'Paragon Government Solutions LLC · 11166 Fairfax Blvd, STE 500, Fairfax, VA 22030'

export function resendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

function appUrl(): string {
  return (process.env.APP_URL || 'https://app.quorumsuite.com').replace(/\/+$/, '')
}

/** Merge {{orgName}} etc. and append the required CAN-SPAM footer. */
export function renderEmail(
  bodyHtml: string,
  lead: { orgName: string; unsubToken: string },
): string {
  const merged = bodyHtml
    .split('{{orgName}}').join(escapeHtml(lead.orgName))
    .split('{{org}}').join(escapeHtml(lead.orgName))
  const unsub = `${appUrl()}/api/outreach/unsubscribe?token=${encodeURIComponent(lead.unsubToken)}`
  const footer = `
    <hr style="border:none;border-top:1px solid #e7e4db;margin:26px 0 14px" />
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#8b8074;line-height:1.6">
      You received this email because we found ${escapeHtml(lead.orgName)} in public nonprofit records and thought Quorum could help.
      <br />${POSTAL}
      <br /><a href="${unsub}" style="color:#a15c39">Unsubscribe</a> — we'll remove you immediately and never contact you again.
    </div>`
  return `<div style="max-width:560px;margin:0 auto">${merged}${footer}</div>`
}

export interface SendResult {
  ok: boolean
  dryRun: boolean
  error?: string
}

/** The platform's own verified sender, used for outreach and as the
 *  fallback for transactional email when an org has no verified domain. */
export function defaultFrom(): string {
  return process.env.OUTREACH_FROM || 'Quorum <hello@quorumsuite.com>'
}

/** Send one email via Resend, or record a dry-run when unconfigured.
 *  `from` and `replyTo` let transactional callers send as an org's own
 *  address (or fall back to the platform sender with the org as reply-to). */
export async function sendEmail(input: {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: true, dryRun: true }
  const from = input.from || defaultFrom()
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    })
    if (!res.ok) return { ok: false, dryRun: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 160)}` }
    return { ok: true, dryRun: false }
  } catch (e) {
    return { ok: false, dryRun: false, error: e instanceof Error ? e.message : 'send failed' }
  }
}

interface DomainDns {
  record: string
  name: string
  type: string
  value: string
  priority?: number
}
interface DomainStatus {
  ok: boolean
  id?: string
  status?: string
  verified: boolean
  records: DomainDns[]
  error?: string
}

/** Register (idempotently) an org's sending domain with Resend and return the
 *  DNS records they must add. Requires a RESEND_API_KEY with domain scope. */
export async function registerDomain(domain: string): Promise<DomainStatus> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: true, verified: false, records: [], status: 'not_configured' }
  try {
    const res = await fetch('https://api.resend.com/domains', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ name: domain }),
    })
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    // Resend returns 422 with an existing id when the domain is already added.
    const id = (body?.id as string) || ''
    if (!res.ok && !id) {
      return { ok: false, verified: false, records: [], error: `Resend ${res.status}: ${JSON.stringify(body).slice(0, 160)}` }
    }
    return {
      ok: true,
      id,
      status: (body?.status as string) || 'pending',
      verified: body?.status === 'verified',
      records: normalizeRecords(body?.records),
    }
  } catch (e) {
    return { ok: false, verified: false, records: [], error: e instanceof Error ? e.message : 'domain add failed' }
  }
}

/** Ask Resend to (re)check verification for a domain id and report status. */
export async function checkDomain(domainId: string): Promise<DomainStatus> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: true, verified: false, records: [], status: 'not_configured' }
  try {
    // Trigger verification, then read current status + records.
    await fetch(`https://api.resend.com/domains/${domainId}/verify`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
    }).catch(() => {})
    const res = await fetch(`https://api.resend.com/domains/${domainId}`, {
      headers: { authorization: `Bearer ${key}` },
    })
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) return { ok: false, verified: false, records: [], error: `Resend ${res.status}` }
    return {
      ok: true,
      id: domainId,
      status: (body?.status as string) || 'pending',
      verified: body?.status === 'verified',
      records: normalizeRecords(body?.records),
    }
  } catch (e) {
    return { ok: false, verified: false, records: [], error: e instanceof Error ? e.message : 'domain check failed' }
  }
}

function normalizeRecords(raw: unknown): DomainDns[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r) => ({
    record: String(r?.record ?? ''),
    name: String(r?.name ?? ''),
    type: String(r?.type ?? ''),
    value: String(r?.value ?? ''),
    ...(r?.priority != null ? { priority: Number(r.priority) } : {}),
  }))
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

/**
 * Professionally designed, email-client-safe first-touch template.
 * Table-based layout + inline styles for Gmail/Outlook/Apple Mail. The
 * outreach engine appends the CAN-SPAM unsubscribe line after this footer.
 */
export const DEFAULT_TEMPLATE = {
  subject: 'A simpler way to run {{orgName}}’s board',
  body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ec;font-family:Arial,Helvetica,sans-serif">
<tr><td align="center" style="padding:8px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e8e0d2;border-radius:14px;overflow:hidden">

  <!-- header -->
  <tr><td style="background:#271c15;padding:26px 32px" align="left">
    <span style="font-size:24px;font-weight:bold;color:#fbf6ee;letter-spacing:-.01em">Quorum<span style="color:#c8552e">.</span></span>
    <span style="font-size:12px;color:#c8552e;font-weight:bold;letter-spacing:.16em;text-transform:uppercase;padding-left:12px">The Nonprofit Board OS</span>
  </td></tr>

  <!-- body -->
  <tr><td style="padding:30px 32px 8px">
    <p style="margin:0 0 16px;font-size:16px;color:#2c231c;line-height:1.6">Hi {{orgName}} team,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#2c231c;line-height:1.65">Running a nonprofit board means juggling filings, bylaws, votes, and signatures — usually across email threads and scattered docs. We built <strong>Quorum</strong> to put all of it in one place:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">
      <tr><td style="padding:4px 0;font-size:15px;color:#4a4038;line-height:1.5">✅ &nbsp;A plain-English launch &amp; compliance checklist</td></tr>
      <tr><td style="padding:4px 0;font-size:15px;color:#4a4038;line-height:1.5">✍️ &nbsp;E-signatures for your whole board</td></tr>
      <tr><td style="padding:4px 0;font-size:15px;color:#4a4038;line-height:1.5">🗳️ &nbsp;Motions with live vote tallies, on the record</td></tr>
      <tr><td style="padding:4px 0;font-size:15px;color:#4a4038;line-height:1.5">📅 &nbsp;One calendar for meetings &amp; deadlines, with one-click Zoom</td></tr>
    </table>
    <p style="margin:0 0 22px;font-size:15px;color:#2c231c;line-height:1.65">It was built while launching a real 501(c)(3) — so it fits how boards actually work.</p>

    <!-- primary CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 22px"><tr>
      <td align="center" style="border-radius:10px;background:#c8552e">
        <a href="https://app.quorumsuite.com" style="display:inline-block;padding:14px 30px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">Start free — create your organization →</a>
      </td>
    </tr></table>
    <p style="margin:0 0 24px;font-size:13px;color:#7c6f63;text-align:center;line-height:1.5">No credit card. Look around in a couple of minutes.</p>

    <!-- video buttons -->
    <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#a15c39;letter-spacing:.05em;text-transform:uppercase">See it in action</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" style="padding:0 5px 0 0">
        <a href="https://www.quorumsuite.com/videos.html" style="display:block;text-align:center;padding:12px;font-size:14px;font-weight:bold;color:#a15c39;text-decoration:none;border:1px solid #e8e0d2;border-radius:10px;background:#faf4ed">▶ &nbsp;What is Quorum? (3 min)</a>
      </td>
      <td width="50%" style="padding:0 0 0 5px">
        <a href="https://www.quorumsuite.com/videos.html" style="display:block;text-align:center;padding:12px;font-size:14px;font-weight:bold;color:#a15c39;text-decoration:none;border:1px solid #e8e0d2;border-radius:10px;background:#faf4ed">▶ &nbsp;Full walkthrough (7 min)</a>
      </td>
    </tr></table>

    <p style="margin:22px 0 0;font-size:15px;color:#2c231c;line-height:1.6">Happy to answer any questions — just reply to this email.</p>
    <p style="margin:14px 0 0;font-size:15px;color:#2c231c">— The Quorum Team</p>
  </td></tr>

  <!-- footer -->
  <tr><td style="background:#271c15;padding:24px 32px">
    <p style="margin:0 0 6px;font-size:14px;color:#fbf6ee;font-weight:bold">Paragon Government Solutions LLC <span style="color:#8b8074;font-weight:normal">DBA Quorum</span></p>
    <p style="margin:0 0 10px;font-size:12.5px;color:#b8ada0;line-height:1.7">
      11166 Fairfax Blvd, STE 500, Fairfax, VA 22030<br>
      <a href="tel:+18884956935" style="color:#e8b49b;text-decoration:none">888.495.6935</a> &nbsp;·&nbsp;
      <a href="mailto:support@quorumsuite.com" style="color:#e8b49b;text-decoration:none">support@quorumsuite.com</a>
    </p>
    <p style="margin:0;font-size:12.5px;color:#9a8574">
      <a href="https://www.quorumsuite.com" style="color:#c9beb0;text-decoration:none">Website</a> &nbsp;·&nbsp;
      <a href="https://www.quorumsuite.com/pricing.html" style="color:#c9beb0;text-decoration:none">Pricing</a> &nbsp;·&nbsp;
      <a href="https://www.quorumsuite.com/app.html" style="color:#c9beb0;text-decoration:none">Get the app</a> &nbsp;·&nbsp;
      <a href="https://www.quorumsuite.com/videos.html" style="color:#c9beb0;text-decoration:none">Videos</a>
    </p>
    <p style="margin:12px 0 0;font-size:11px;color:#6f6353;line-height:1.6">Quorum is software, not a law firm or accounting firm — nothing here is legal or tax advice.</p>
  </td></tr>

</table>
</td></tr>
</table>`,
}
