import { useState } from 'react'
import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { IconInfo, IconPlus } from '../components/icons'
import { Avatar, YouChip } from '../components/shared'
import type { AccountStatus } from '../types'

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
              Subscription:{' '}
              {store.apiOrg.plan === 'growth' ? 'Growth' : store.apiOrg.plan === 'launch_partner' ? 'Launch Partner' : 'Free preview'}
              {store.apiOrg.plan !== 'none' && (
                <span style={sx('margin-left:8px;font-size:11px;font-weight:600;color:var(--good);background:var(--good-soft);padding:2px 9px;border-radius:20px;vertical-align:middle')}>
                  {store.apiOrg.planStatus}
                </span>
              )}
            </div>
            <div style={sx('font-size:12.5px;color:var(--muted);margin-top:2px')}>
              {store.apiOrg.plan === 'none'
                ? 'Upgrade to unlock the full portal for your board.'
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
                    ['starter', 'Starter', '$29/mo', '$290/yr'],
                    ['growth', 'Growth', '$59/mo', '$590/yr'],
                    ['scale', 'Scale', '$99/mo', '$990/yr'],
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

      {state.emailConnected ? (
        <div style={sx('display:flex;align-items:center;gap:14px;background:var(--good-soft);border:1px solid var(--good);border-radius:13px;padding:13px 18px;margin-bottom:18px')}>
          <div style={sx('width:34px;height:34px;border-radius:9px;background:#673de6;color:#fff;display:grid;place-items:center;flex:none;font-weight:800;font-size:15px;font-family:Spectral,serif')}>h</div>
          <div style={sx('flex:1;min-width:0')}>
            <div style={sx('font-size:13.5px;font-weight:600;color:var(--good)')}>Hostinger email connected</div>
            <div style={sx('font-size:12px;color:var(--muted)')}>Sending as admin@adamsinfinitelegacy.org via Hostinger</div>
          </div>
          <button
            className="hv-border-danger"
            onClick={store.disconnectEmail}
            style={sx('border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;flex:none')}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div style={sx('display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:15px 18px;margin-bottom:18px')}>
          <div style={sx('width:42px;height:42px;border-radius:11px;background:#673de6;color:#fff;display:grid;place-items:center;flex:none;font-weight:800;font-size:18px;font-family:Spectral,serif')}>h</div>
          <div style={sx('flex:1;min-width:0')}>
            <div style={sx('font-size:14px;font-weight:600')}>Connect foundation email to send documents</div>
            <div style={sx('font-size:12.5px;color:var(--muted);line-height:1.5;margin-top:2px')}>
              Link your Hostinger mailbox so DocuSeal invitations and reminders are sent from your foundation address to each member's personal email.
            </div>
          </div>
          <button
            className="hv-hostinger"
            onClick={store.connectEmail}
            style={sx('border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:13px;font-weight:600;padding:10px 16px;border-radius:10px;cursor:pointer;flex:none')}
          >
            Connect Hostinger
          </button>
        </div>
      )}

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
