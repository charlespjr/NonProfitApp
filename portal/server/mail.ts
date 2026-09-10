/**
 * Board-facing transactional email (vote requests, signing reminders, member
 * invites). Sent through the organization's OWN mail server (SMTP, e.g.
 * GoDaddy) — never Resend. Resend stays reserved for the platform's own
 * outreach CRM; board email that isn't configured simply reports that it
 * needs setting up, so an org is never shown a Resend domain-verification
 * message for a service it doesn't use.
 */
import nodemailer from 'nodemailer'
import type { orgs } from './schema.js'

type Org = typeof orgs.$inferSelect

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

/** True when the org has a complete SMTP relay configured (e.g. GoDaddy). */
function smtpOf(org: Org): SmtpConfig | null {
  if (!org.smtpHost || !org.smtpUser || !org.smtpPass) return null
  return {
    host: org.smtpHost,
    port: org.smtpPort || (org.smtpSecure ? 465 : 587),
    secure: org.smtpSecure,
    user: org.smtpUser,
    pass: org.smtpPass,
  }
}

/** Send one message through an SMTP relay (the org's own mailbox). Timeouts
 *  are short so a bad host can't hang a serverless invocation. */
export async function sendViaSmtp(
  cfg: SmtpConfig,
  msg: { from: string; to: string; subject: string; html: string; replyTo?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 8_000,
      socketTimeout: 12_000,
    })
    // Align the SMTP envelope (return-path) with the authenticated mailbox so
    // SPF passes even when the visible From address is a different alias —
    // a common reason a message that works internally lands in spam externally.
    const text = msg.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    await transport.sendMail({
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text,
      replyTo: msg.replyTo || cfg.user,
      envelope: { from: cfg.user, to: msg.to },
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'SMTP send failed' }
  }
}

function appUrl(): string {
  return (process.env.APP_URL || 'https://app.quorumsuite.com').replace(/\/+$/, '')
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

export { smtpOf }

/** The From line for the org's own mailbox. */
function fromFor(org: Org, smtp: SmtpConfig): string {
  const name = org.name.replace(/[<>]/g, '').trim() || 'Quorum'
  return `${name} <${org.fromEmail || smtp.user}>`
}

/** Shared, email-client-safe layout (table + inline styles). */
function layout(orgName: string, heading: string, bodyHtml: string, cta?: { text: string; url: string }): string {
  const button = cta
    ? `<tr><td style="padding:8px 32px 26px"><a href="${cta.url}" style="display:inline-block;background:#c8552e;color:#fff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:10px">${escapeHtml(cta.text)}</a></td></tr>`
    : ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ec;font-family:Arial,Helvetica,sans-serif">
<tr><td align="center" style="padding:8px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e8e0d2;border-radius:14px;overflow:hidden">
  <tr><td style="background:#271c15;padding:22px 32px" align="left">
    <span style="font-size:22px;font-weight:bold;color:#fbf6ee;letter-spacing:-.01em">${escapeHtml(orgName)}</span>
    <span style="font-size:11px;color:#c8552e;font-weight:bold;letter-spacing:.14em;text-transform:uppercase;padding-left:12px">via Quorum</span>
  </td></tr>
  <tr><td style="padding:28px 32px 6px">
    <h1 style="margin:0 0 14px;font-size:19px;color:#271c15">${escapeHtml(heading)}</h1>
    <div style="font-size:15px;color:#2c231c;line-height:1.6">${bodyHtml}</div>
  </td></tr>
  ${button}
  <tr><td style="padding:0 32px 24px">
    <hr style="border:none;border-top:1px solid #e7e4db;margin:8px 0 12px" />
    <div style="font-size:12px;color:#8b8074;line-height:1.6">Sent by ${escapeHtml(orgName)} through Quorum, its board portal. If you weren't expecting this, you can ignore it.</div>
  </td></tr>
</table></td></tr></table>`
}

export interface VoteEmailInput {
  motionTitle: string
  motionDesc?: string
  meetingTitle?: string
}

export function voteEmail(org: Org, m: VoteEmailInput): { subject: string; html: string } {
  const body = `<p style="margin:0 0 14px">A motion is ready for your vote on the ${escapeHtml(org.name)} board portal:</p>
    <p style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#271c15">${escapeHtml(m.motionTitle)}</p>
    ${m.motionDesc ? `<p style="margin:0 0 14px;color:#4a4038">${escapeHtml(m.motionDesc)}</p>` : ''}
    ${m.meetingTitle ? `<p style="margin:0 0 14px;color:#4a4038">Discussion: ${escapeHtml(m.meetingTitle)}</p>` : ''}
    <p style="margin:0 0 6px">Sign in to review the details and cast your vote (for, against, or abstain).</p>`
  return {
    subject: `Board vote requested: ${m.motionTitle}`,
    html: layout(org.name, 'A board vote needs your attention', body, { text: 'Review & vote', url: appUrl() }),
  }
}

export function signEmail(org: Org, docName: string): { subject: string; html: string } {
  const body = `<p style="margin:0 0 14px">A document is waiting for your electronic signature on the ${escapeHtml(org.name)} board portal:</p>
    <p style="margin:0 0 14px;font-size:16px;font-weight:bold;color:#271c15">${escapeHtml(docName)}</p>
    <p style="margin:0 0 6px">Sign in to review it and sign securely.</p>`
  return {
    subject: `Signature requested: ${docName}`,
    html: layout(org.name, 'A document needs your signature', body, { text: 'Review & sign', url: appUrl() }),
  }
}

/** The governance noun for who a member is, by entity type. */
function memberNoun(org: Org): string {
  return org.entityType === 'llc' ? 'member' : 'board member'
}

export function inviteEmail(
  org: Org,
  m: {
    name: string
    username: string
    tempPassword: string
    /** The admin who sent the invite — named in the email. */
    inviterName?: string
    inviterTitle?: string
  },
): { subject: string; html: string } {
  const first = m.name.split(' ')[0] || m.name
  const role = memberNoun(org)
  const inviter = m.inviterName
    ? `${escapeHtml(m.inviterName)}${m.inviterTitle ? `, ${escapeHtml(m.inviterTitle)} of ${escapeHtml(org.name)},` : ` of ${escapeHtml(org.name)}`}`
    : escapeHtml(org.name)
  const body = `<p style="margin:0 0 14px">Hi ${escapeHtml(first)},</p>
    <p style="margin:0 0 14px">${inviter} is requesting that you sign up for the ${escapeHtml(org.name)} board portal. You've been added as a <strong>${role}</strong>, so you can <strong>vote on motions</strong> and <strong>sign documents electronically</strong>.</p>
    <p style="margin:0 0 6px">Your sign-in details:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 16px;font-size:15px">
      <tr><td style="color:#8b8074;padding:2px 14px 2px 0">Username</td><td style="font-weight:bold;color:#271c15">${escapeHtml(m.username)}</td></tr>
      <tr><td style="color:#8b8074;padding:2px 14px 2px 0">Temporary password</td><td style="font-weight:bold;color:#271c15;font-family:monospace">${escapeHtml(m.tempPassword)}</td></tr>
    </table>
    <p style="margin:0 0 6px">You'll be asked to set your own password the first time you sign in.</p>`
  return {
    subject: `${m.inviterName ? `${m.inviterName} has ` : ''}invited you to join ${org.name}'s board`,
    html: layout(org.name, `You're invited to the ${org.name} board`, body, { text: 'Sign up & get started', url: appUrl() }),
  }
}

/** Send one transactional email through the org's own SMTP mailbox. If SMTP
 *  isn't configured, board email is reported as not-set-up (dryRun) — we do
 *  NOT fall back to Resend, so orgs never see a Resend domain message. */
export async function sendOrgEmail(org: Org, to: string, subject: string, html: string) {
  const smtp = smtpOf(org)
  if (!smtp) {
    return { ok: false, dryRun: true, error: 'Board email is not set up yet. Add your email server (SMTP) under Team & Access → Board email.' }
  }
  const r = await sendViaSmtp(smtp, { from: fromFor(org, smtp), to, subject, html })
  return { ok: r.ok, dryRun: false, error: r.error }
}
