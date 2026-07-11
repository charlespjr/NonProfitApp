import { useEffect, useState } from 'react'
import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { IconInfo, IconPlus } from '../components/icons'
import { Avatar, YouChip } from '../components/shared'
import type { AccountStatus } from '../types'

const PLAN_LABELS: Record<string, string> = {
  none: 'Free preview',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  launch_partner: 'Launch Partner',
}

interface EmailProvider {
  id: string
  name: string
  letter: string
  color: string
  steps: string[]
  smtp: string
}

/** Setup guides for the mailboxes nonprofits actually have — pick yours,
 *  follow the steps, connect. No Hostinger assumption. */
const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    id: 'google',
    name: 'Google Workspace / Gmail',
    letter: 'G',
    color: '#ea4335',
    steps: [
      'Sign in to the Google account your foundation sends mail from (e.g. board@yourfoundation.org).',
      'Open myaccount.google.com → Security and turn on 2-Step Verification if it isn’t already.',
      'Still under Security, search "App passwords" and create one named "Quorum" — Google shows a 16-character password once.',
      'Enter your sending address below and click Connect; use that app password when asked to authorize.',
    ],
    smtp: 'SMTP: smtp.gmail.com · port 587 (STARTTLS)',
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365 / Outlook',
    letter: 'M',
    color: '#0078d4',
    steps: [
      'Sign in at outlook.office.com with the mailbox your foundation sends from.',
      'Ask your Microsoft 365 admin to allow "Authenticated SMTP" for that mailbox (Admin center → Users → the mailbox → Mail → Manage email apps).',
      'If your org uses multi-factor sign-in, create an app password at account.microsoft.com → Security.',
      'Enter your sending address below and click Connect; authorize with the mailbox (or app) password.',
    ],
    smtp: 'SMTP: smtp.office365.com · port 587 (STARTTLS)',
  },
  {
    id: 'zoho',
    name: 'Zoho Mail',
    letter: 'Z',
    color: '#e42527',
    steps: [
      'Sign in at mail.zoho.com with your foundation mailbox.',
      'Open Settings → Security → App Passwords and generate one named "Quorum".',
      'Enter your sending address below and click Connect; authorize with that app password.',
    ],
    smtp: 'SMTP: smtp.zoho.com · port 465 (SSL)',
  },
  {
    id: 'hostinger',
    name: 'Hostinger',
    letter: 'h',
    color: '#673de6',
    steps: [
      'Sign in to Hostinger hPanel and open Emails → your domain.',
      'Create (or locate) the mailbox you want to send from, e.g. board@yourdomain.org, and note its password.',
      'Enter that address below and click Connect; authorize with the mailbox password.',
    ],
    smtp: 'SMTP: smtp.hostinger.com · port 465 (SSL)',
  },
  {
    id: 'namecheap',
    name: 'Namecheap Private Email',
    letter: 'N',
    color: '#de3723',
    steps: [
      'Sign in at privateemail.com with the mailbox your domain’s email is hosted on.',
      'No app password needed — the mailbox address and password are used directly.',
      'Enter your sending address below and click Connect; authorize with the mailbox password.',
    ],
    smtp: 'SMTP: mail.privateemail.com · port 465 (SSL)',
  },
  {
    id: 'other',
    name: 'Other / custom SMTP',
    letter: '@',
    color: 'var(--accent)',
    steps: [
      'Ask your email provider (or whoever manages your domain) for the SMTP host, port, and password for your mailbox.',
      'Common defaults: port 587 with STARTTLS or port 465 with SSL, username = your full email address.',
      'Enter your sending address below and click Connect; you’ll be asked for those SMTP details to authorize.',
    ],
    smtp: 'SMTP host & port: from your provider',
  },
]

/** Provider-agnostic "connect your foundation email" card. */
function EmailCard() {
  const store = useStore()
  const { state } = store
  const [selected, setSelected] = useState<string | null>(null)
  const [address, setAddress] = useState('')

  if (state.emailConnected) {
    const provider = EMAIL_PROVIDERS.find((p) => p.id === state.emailProvider)
    return (
      <div style={sx('display:flex;align-items:center;gap:14px;background:var(--good-soft);border:1px solid var(--good);border-radius:13px;padding:13px 18px;margin-bottom:18px;flex-wrap:wrap')}>
        <div style={{ ...sx('width:34px;height:34px;border-radius:9px;color:#fff;display:grid;place-items:center;flex:none;font-weight:800;font-size:15px;font-family:Spectral,serif'), background: provider?.color || 'var(--accent)' }}>
          {provider?.letter || '@'}
        </div>
        <div style={sx('flex:1;min-width:200px')}>
          <div style={sx('font-size:13.5px;font-weight:600;color:var(--good)')}>Foundation email connected</div>
          <div style={sx('font-size:12px;color:var(--muted)')}>
            Sending as {state.emailAddress || 'your foundation mailbox'}
            {provider ? ` via ${provider.name}` : ''}
          </div>
        </div>
        <button
          className="hv-border-danger"
          onClick={store.disconnectEmail}
          style={sx('border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;flex:none')}
        >
          Disconnect
        </button>
      </div>
    )
  }

  const sel = selected ? EMAIL_PROVIDERS.find((p) => p.id === selected) : null
  const addressOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.trim())

  return (
    <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px 18px;margin-bottom:18px')}>
      <div style={sx('font-size:14px;font-weight:600')}>Connect your foundation email to send documents</div>
      <div style={sx('font-size:12.5px;color:var(--muted);line-height:1.5;margin-top:2px')}>
        DocuSeal invitations, signing reminders, and vote notifications are sent from your foundation's own address.
        Choose your email provider for setup instructions.
      </div>
      <div style={sx('display:flex;gap:8px;flex-wrap:wrap;margin-top:13px')}>
        {EMAIL_PROVIDERS.map((p) => {
          const active = selected === p.id
          return (
            <button
              key={p.id}
              className="hv-border-accent"
              onClick={() => setSelected(active ? null : p.id)}
              style={{
                ...sx('display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;padding:8px 12px;border-radius:10px;cursor:pointer'),
                border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
                background: active ? 'var(--accent-soft)' : 'var(--panel)',
                color: active ? 'var(--brand)' : 'var(--ink)',
              }}
            >
              <span style={{ ...sx('width:20px;height:20px;border-radius:6px;color:#fff;display:grid;place-items:center;flex:none;font-weight:800;font-size:11px;font-family:Spectral,serif'), background: p.color }}>
                {p.letter}
              </span>
              {p.name}
            </button>
          )
        })}
      </div>
      {sel && (
        <div style={sx('margin-top:14px;background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:14px 16px')}>
          <div style={sx('font-size:12px;font-weight:700;color:var(--brand);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px')}>
            {sel.name} — setup
          </div>
          <ol style={sx('margin:0;padding-left:19px;display:flex;flex-direction:column;gap:6px')}>
            {sel.steps.map((s, i) => (
              <li key={i} style={sx('font-size:12.5px;color:var(--ink);line-height:1.55')}>{s}</li>
            ))}
          </ol>
          <div style={sx('font-size:11.5px;color:var(--muted);margin-top:9px;font-family:ui-monospace,monospace')}>{sel.smtp}</div>
          <div style={sx('display:flex;gap:8px;margin-top:12px;flex-wrap:wrap')}>
            <input
              className="inp"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="address to send from, e.g. board@yourfoundation.org"
              style={sx('flex:1;min-width:220px;padding:10px 13px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:13.5px;color:var(--ink);outline:none')}
            />
            <button
              className="hv-bright"
              onClick={() => {
                if (!addressOk) {
                  store.flash('Enter the email address you’ll send from')
                  return
                }
                store.connectEmail(sel.id, sel.name, address.trim().toLowerCase())
              }}
              style={{
                ...sx('border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:10px 18px;border-radius:10px'),
                cursor: addressOk ? 'pointer' : 'not-allowed',
                opacity: addressOk ? 1 : 0.55,
              }}
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const STATUS_META: Record<AccountStatus, { label: string; css: string }> = {
  active: { label: 'Active', css: 'display:inline-flex;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;background:var(--good-soft);color:var(--good)' },
  invited: { label: 'Invited', css: 'display:inline-flex;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;background:var(--warn-soft);color:var(--warn)' },
  none: { label: 'No login', css: 'display:inline-flex;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;background:var(--bg);color:var(--muted);border:1px solid var(--line)' },
}

const AVATAR_BG: Record<AccountStatus, string> = {
  active: 'var(--accent)',
  invited: 'var(--warn)',
  none: 'var(--muted)',
}

const permPill = sx('font-size:11px;font-weight:600;color:var(--brand);background:var(--accent-soft);padding:3px 9px;border-radius:20px')

export function Team() {
  const store = useStore()
  const { state, currentUser } = store
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  // Re-read the plan when an admin lands here — if they paid in the
  // QuickBooks tab, this is the moment the portal unlocks.
  useEffect(() => {
    if (store.mode === 'api' && store.apiMe?.isAdmin) void store.refreshPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={sx('max-width:920px;margin:0 auto')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:16px')}>
        <div>
          <div style={sx('font-family:Spectral,serif;font-size:22px;font-weight:600')}>Team &amp; access</div>
          <div style={sx('font-size:13.5px;color:var(--muted);margin-top:3px')}>Set up logins for your board so they can sign in to vote and sign documents.</div>
        </div>
        <button
          className="hv-bright"
          onClick={store.addMember}
          style={sx('display:flex;align-items:center;gap:8px;border:none;background:var(--brand);color:#fff;font-size:13.5px;font-weight:600;padding:11px 16px;border-radius:10px;cursor:pointer')}
        >
          <IconPlus /> Add member
        </button>
      </div>

      {store.mode === 'api' && store.apiOrg && (
        <div style={sx('display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:15px 18px;margin-bottom:14px;flex-wrap:wrap')}>
          <div style={sx('flex:1;min-width:200px')}>
            <div style={sx('font-size:14px;font-weight:600')}>
              Subscription: {PLAN_LABELS[store.apiOrg.plan] || store.apiOrg.plan}
              {store.apiOrg.plan !== 'none' && (
                <span style={sx('margin-left:8px;font-size:11px;font-weight:600;color:var(--good);background:var(--good-soft);padding:2px 9px;border-radius:20px;vertical-align:middle')}>
                  {store.apiOrg.planStatus}
                </span>
              )}
            </div>
            <div style={sx('font-size:12.5px;color:var(--muted);margin-top:2px')}>
              {store.apiOrg.plan === 'none'
                ? 'The free preview is read-only — pick a plan to unlock changes, member logins, and documents. Starter includes up to 7 board members; Growth and Scale are unlimited.'
                : 'Manage your payment method, invoices, or cancellation any time.'}
            </div>
          </div>
          {store.apiOrg.plan === 'none' ? (
            <div style={sx('display:flex;flex-direction:column;gap:8px;align-items:flex-end')}>
              <div style={sx('display:flex;gap:6px')}>
                {(['monthly', 'yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    style={{
                      ...sx('font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:20px;cursor:pointer'),
                      border: '1px solid ' + (period === p ? 'var(--accent)' : 'var(--line)'),
                      background: period === p ? 'var(--accent-soft)' : 'var(--panel)',
                      color: period === p ? 'var(--brand)' : 'var(--muted)',
                    }}
                  >
                    {p === 'monthly' ? 'Monthly' : 'Yearly — 2 months free'}
                  </button>
                ))}
              </div>
              <div style={sx('display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end')}>
                {(
                  [
                    ['starter', 'Starter', '$49/mo', '$490/yr'],
                    ['growth', 'Growth', '$149/mo', '$1,490/yr'],
                    ['scale', 'Scale', '$299/mo', '$2,990/yr'],
                  ] as const
                ).map(([tier, label, mPrice, yPrice]) => (
                  <button
                    key={tier}
                    className={tier === 'growth' ? 'hv-bright' : 'hv-border-accent'}
                    onClick={() => void store.checkout(tier, period)}
                    style={sx(
                      tier === 'growth'
                        ? 'border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:10px 16px;border-radius:10px;cursor:pointer'
                        : 'border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:13px;font-weight:600;padding:10px 16px;border-radius:10px;cursor:pointer',
                    )}
                  >
                    {label} · {period === 'monthly' ? mPrice : yPrice}
                  </button>
                ))}
              </div>
              <a
                href="mailto:support@quorumsuite.com?subject=Quorum%20Launch%20Partner%20%E2%80%94%20request%20a%20quote"
                style={sx('font-size:12px;color:var(--accent);font-weight:600;text-decoration:none')}
              >
                Want white-glove setup? Request a Launch Partner quote →
              </a>
            </div>
          ) : (
            <button
              className="hv-border-accent"
              onClick={() => void store.openBillingPortal()}
              style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:13px;font-weight:600;padding:10px 16px;border-radius:10px;cursor:pointer')}
            >
              Manage billing
            </button>
          )}
        </div>
      )}

      <div style={sx('display:flex;align-items:flex-start;gap:11px;background:var(--accent-soft);border-radius:12px;padding:13px 16px;margin-bottom:14px')}>
        <IconInfo style={{ flex: 'none', marginTop: 1 }} />
        <div style={sx('font-size:12.5px;color:var(--brand);line-height:1.55')}>
          Each board member signs in with a <strong>username &amp; password</strong> you set — they don't need a foundation email. Their <strong>personal email</strong> is where DocuSeal sends documents to sign. Give <strong>Vote</strong> access to weigh in on motions; you keep <strong>Sign</strong>/admin rights.
        </div>
      </div>

      <EmailCard />

      <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden')}>
        <div data-m="teamhead" style={sx('display:grid;grid-template-columns:minmax(0,1fr) 150px 150px 120px;gap:12px;padding:12px 20px;border-bottom:1px solid var(--line);font-size:11px;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;font-weight:600')}>
          <div>Member</div><div>Login status</div><div>Permissions</div><div style={{ textAlign: 'right' }}>Manage</div>
        </div>
        {store.roster().map((m) => {
          const a = state.accounts[m.id]
          const status: AccountStatus = a?.status || 'none'
          return (
            <div key={m.id} data-m="teamrow" className="hv-row" style={sx('display:grid;grid-template-columns:minmax(0,1fr) 150px 150px 120px;gap:12px;padding:14px 20px;border-bottom:1px solid var(--line);align-items:center')}>
              <div style={sx('display:flex;align-items:center;gap:13px;min-width:0')}>
                <Avatar initials={m.initials} bg={AVATAR_BG[status]} size={38} fontSize={13} />
                <div style={sx('min-width:0')}>
                  <div style={sx('font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
                    {m.name}
                    <YouChip show={m.id === currentUser!.member.id} />
                  </div>
                  <div style={sx('font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
                    {(a?.username ? '@' + a.username : 'No username') + (a?.email ? ' · ' + a.email : '')}
                  </div>
                </div>
              </div>
              <div><span style={sx(STATUS_META[status].css)}>{STATUS_META[status].label}</span></div>
              <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}>
                {a?.vote && <span style={permPill}>Vote</span>}
                {a?.sign && <span style={permPill}>Sign</span>}
                {!a?.vote && !a?.sign && <span style={sx('font-size:11px;color:var(--muted)')}>—</span>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  className="hv-border-accent"
                  onClick={() => store.manageMember(m.id)}
                  style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer')}
                >
                  Manage
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
