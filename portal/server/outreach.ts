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

/** Send one email via Resend, or record a dry-run when unconfigured. */
export async function sendEmail(input: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: true, dryRun: true }
  const from = process.env.OUTREACH_FROM || 'Quorum <hello@quorumsuite.com>'
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html }),
    })
    if (!res.ok) return { ok: false, dryRun: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 160)}` }
    return { ok: true, dryRun: false }
  } catch (e) {
    return { ok: false, dryRun: false, error: e instanceof Error ? e.message : 'send failed' }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

/** A ready-to-edit first-touch template for the composer. */
export const DEFAULT_TEMPLATE = {
  subject: 'A simpler way to run {{orgName}}’s board',
  body: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2c231c;line-height:1.6">
  <p>Hi {{orgName}} team,</p>
  <p>Running a nonprofit board means juggling filings, bylaws, votes, and signatures — usually across email threads and scattered docs. We built <strong>Quorum</strong> to put all of it in one place: a plain-English launch &amp; compliance checklist, e-signatures for your whole board, motions with live vote tallies, and a shared calendar with one-click Zoom.</p>
  <p>It was built while launching a real 501(c)(3) — so it fits how boards actually work.</p>
  <p>You can create your organization free (no card) and look around in a couple of minutes:<br />
  <a href="https://app.quorumsuite.com" style="color:#a15c39;font-weight:bold">app.quorumsuite.com</a></p>
  <p>Happy to answer any questions — just reply to this email.</p>
  <p>— The Quorum Team</p>
</div>`,
}
