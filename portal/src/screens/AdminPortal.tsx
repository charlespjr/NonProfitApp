import { useCallback, useEffect, useState } from 'react'
import { sx } from '../lib/sx'
import { THEMES } from '../styles/theme'
import { AdminOutreach } from './AdminOutreach'

interface AdminOrgRow {
  id: string
  name: string
  createdAt: string
  plan: string
  planStatus: string
  aiConfigured: boolean
  members: number
  adminName: string
  adminEmail: string
  stateVersion: number
  lastActivity: string
  openInvoices: number
  paidInvoices: number
}

const PLANS = ['none', 'starter', 'growth', 'scale', 'launch_partner'] as const
const PLAN_LABEL: Record<string, string> = {
  none: 'Free preview',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  launch_partner: 'Launch Partner',
}
/** Monthly value per active plan, for the MRR estimate chip. */
const PLAN_MRR: Record<string, number> = { starter: 49, growth: 149, scale: 299, launch_partner: 149 }

const KEY_STORAGE = 'quorum_admin_key'

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/**
 * Owner console at /admin: every organization on the platform — plan,
 * board size, admin contact, activity — with plan changes and org deletion.
 * Everything is authorized by the ADMIN_KEY secret (sent per request,
 * kept only in sessionStorage), completely separate from customer logins.
 */
export function AdminPortal() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '')
  const [input, setInput] = useState('')
  const [rows, setRows] = useState<AdminOrgRow[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [planPick, setPlanPick] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<'orgs' | 'outreach'>('orgs')

  const load = useCallback(
    async (k: string) => {
      setError('')
      try {
        const res = await fetch('/api/admin/orgs', { headers: { 'x-admin-key': k } })
        if (res.status === 403) {
          sessionStorage.removeItem(KEY_STORAGE)
          setKey('')
          setRows(null)
          setError('That admin key was rejected.')
          return
        }
        const body = (await res.json()) as { orgs: AdminOrgRow[] }
        sessionStorage.setItem(KEY_STORAGE, k)
        setKey(k)
        setRows(body.orgs)
      } catch {
        setError('Could not reach the server — try again.')
      }
    },
    [],
  )

  useEffect(() => {
    if (key) void load(key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setPlan = async (orgId: string) => {
    const plan = planPick[orgId]
    if (!plan) return
    setBusy(orgId)
    try {
      const res = await fetch('/api/billing/activate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ orgId, plan }),
      })
      if (!res.ok) setError('Plan change failed (' + res.status + ')')
      await load(key)
    } finally {
      setBusy('')
    }
  }

  const deleteOrg = async (row: AdminOrgRow) => {
    if (!window.confirm(`Delete "${row.name}" and its ${row.members} member login(s)? This cannot be undone.`)) return
    setBusy(row.id)
    try {
      const res = await fetch('/api/admin/orgs/' + row.id, { method: 'DELETE', headers: { 'x-admin-key': key } })
      if (!res.ok) setError('Delete failed (' + res.status + ')')
      await load(key)
    } finally {
      setBusy('')
    }
  }

  const shell = {
    ...sx("font-family:'Public Sans',system-ui,sans-serif;min-height:100vh;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;padding:34px 22px"),
    ...sx(THEMES.warm),
  }

  if (!rows) {
    return (
      <div style={shell}>
        <div style={sx('max-width:420px;margin:12vh auto 0;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:30px')}>
          <div style={sx('display:flex;align-items:center;gap:11px;margin-bottom:16px')}>
            <div style={sx('width:38px;height:38px;border-radius:10px;background:var(--brand);color:#fff;display:grid;place-items:center;font-family:Spectral,serif;font-size:19px;font-weight:600')}>Q</div>
            <div>
              <div style={sx('font-family:Spectral,serif;font-size:19px;font-weight:600')}>Quorum Admin</div>
              <div style={sx('font-size:12px;color:var(--muted)')}>Owner console — organizations &amp; plans</div>
            </div>
          </div>
          <label style={sx('font-size:12.5px;font-weight:600')}>Admin key</label>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input.trim() && void load(input.trim())}
            placeholder="ADMIN_KEY from Vercel"
            style={sx('width:100%;margin-top:7px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg);font-size:14px;color:var(--ink);outline:none;font-family:ui-monospace,monospace')}
          />
          {error && <div style={sx('margin-top:10px;font-size:12.5px;color:var(--danger)')}>{error}</div>}
          <button
            className="hv-bright"
            onClick={() => input.trim() && void load(input.trim())}
            style={sx('margin-top:16px;width:100%;padding:12px;border:none;border-radius:10px;background:var(--brand);color:#fff;font-size:14px;font-weight:600;cursor:pointer')}
          >
            Open console
          </button>
          <div style={sx('margin-top:12px;font-size:11.5px;color:var(--muted);line-height:1.5')}>
            The key stays in this tab only. Never share it — it controls every organization's plan.
          </div>
        </div>
      </div>
    )
  }

  const active = rows.filter((r) => r.plan !== 'none' && r.planStatus === 'active')
  const mrr = active.reduce((s, r) => s + (PLAN_MRR[r.plan] || 0), 0)

  return (
    <div style={shell}>
      <div style={sx('max-width:1180px;margin:0 auto')}>
        <div style={sx('display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px')}>
          <div style={sx('width:38px;height:38px;border-radius:10px;background:var(--brand);color:#fff;display:grid;place-items:center;font-family:Spectral,serif;font-size:19px;font-weight:600')}>Q</div>
          <div style={sx('flex:1;min-width:200px')}>
            <div style={sx('font-family:Spectral,serif;font-size:22px;font-weight:600')}>Quorum Admin</div>
            <div style={sx('display:flex;gap:6px;margin-top:8px')}>
              {(['orgs', 'outreach'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    ...sx('font-size:12.5px;font-weight:600;padding:6px 14px;border-radius:9px;cursor:pointer;border:1px solid'),
                    borderColor: tab === t ? 'var(--accent)' : 'var(--line)',
                    background: tab === t ? 'var(--accent-soft)' : 'var(--panel)',
                    color: tab === t ? 'var(--brand)' : 'var(--muted)',
                  }}
                >
                  {t === 'orgs' ? 'Organizations' : 'Outreach'}
                </button>
              ))}
            </div>
          </div>
          <div style={sx('display:flex;gap:8px;flex-wrap:wrap')}>
            {tab === 'orgs' && <>
              <span style={sx('font-size:12px;font-weight:700;background:var(--panel);border:1px solid var(--line);padding:6px 12px;border-radius:20px')}>{rows.length} orgs</span>
              <span style={sx('font-size:12px;font-weight:700;color:var(--good);background:var(--good-soft);padding:6px 12px;border-radius:20px')}>{active.length} paying</span>
              <span style={sx('font-size:12px;font-weight:700;color:var(--brand);background:var(--accent-soft);padding:6px 12px;border-radius:20px')}>≈ ${mrr.toLocaleString()}/mo</span>
              <button
                onClick={() => void load(key)}
                style={sx('font-size:12px;font-weight:700;background:var(--panel);border:1px solid var(--line);color:var(--brand);padding:6px 12px;border-radius:20px;cursor:pointer')}
              >
                ↻ Refresh
              </button>
            </>}
            <button
              onClick={() => { sessionStorage.removeItem(KEY_STORAGE); setKey(''); setRows(null); setInput('') }}
              style={sx('font-size:12px;font-weight:700;background:var(--panel);border:1px solid var(--line);color:var(--muted);padding:6px 12px;border-radius:20px;cursor:pointer')}
            >
              Lock
            </button>
          </div>
        </div>

        {tab === 'outreach' ? (
          <AdminOutreach adminKey={key} />
        ) : (<>
        {error && <div style={sx('margin-bottom:12px;font-size:12.5px;color:var(--danger);background:var(--warn-soft);padding:9px 13px;border-radius:9px')}>{error}</div>}

        <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow-x:auto')}>
          <div style={sx('min-width:980px')}>
            <div style={sx('display:grid;grid-template-columns:minmax(0,1.3fr) 110px 170px 70px minmax(0,1.2fr) 120px 190px;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line);font-size:11px;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;font-weight:600')}>
              <div>Organization</div><div>Signed up</div><div>Plan</div><div>Board</div><div>Admin</div><div>Invoices</div><div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            {rows.map((r) => (
              <div key={r.id} data-m="adminrow" className="hv-row" style={sx('display:grid;grid-template-columns:minmax(0,1.3fr) 110px 170px 70px minmax(0,1.2fr) 120px 190px;gap:12px;padding:13px 18px;border-bottom:1px solid var(--line);align-items:center')}>
                <div style={sx('min-width:0')}>
                  <div style={sx('font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.name}</div>
                  <div style={sx('font-size:11px;color:var(--muted);font-family:ui-monospace,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.id}{r.aiConfigured ? ' · AI ✓' : ''}</div>
                </div>
                <div style={sx('font-size:12.5px;color:var(--muted)')}>{fmtDate(r.createdAt)}</div>
                <div>
                  <span
                    style={{
                      ...sx('display:inline-flex;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px'),
                      ...(r.plan !== 'none' && r.planStatus === 'active'
                        ? sx('background:var(--good-soft);color:var(--good)')
                        : sx('background:var(--bg);color:var(--muted);border:1px solid var(--line)')),
                    }}
                  >
                    {PLAN_LABEL[r.plan] || r.plan}{r.plan !== 'none' ? ` · ${r.planStatus}` : ''}
                  </span>
                </div>
                <div style={sx('font-size:13px;font-weight:600')}>{r.members}</div>
                <div style={sx('min-width:0;font-size:12.5px')}>
                  <div style={sx('font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.adminName}</div>
                  <div style={sx('color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{r.adminEmail}</div>
                </div>
                <div style={sx('font-size:12px;color:var(--muted)')}>{r.paidInvoices} paid{r.openInvoices ? ` · ${r.openInvoices} open` : ''}</div>
                <div style={sx('display:flex;gap:6px;justify-content:flex-end;align-items:center')}>
                  <select
                    value={planPick[r.id] ?? r.plan}
                    onChange={(e) => setPlanPick((p) => ({ ...p, [r.id]: e.target.value }))}
                    style={sx('font-size:12px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)')}
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>{PLAN_LABEL[p]}</option>
                    ))}
                  </select>
                  <button
                    className="hv-border-accent"
                    disabled={busy === r.id || (planPick[r.id] ?? r.plan) === r.plan}
                    onClick={() => void setPlan(r.id)}
                    style={{
                      ...sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12px;font-weight:600;padding:6px 10px;border-radius:8px'),
                      cursor: (planPick[r.id] ?? r.plan) === r.plan ? 'not-allowed' : 'pointer',
                      opacity: (planPick[r.id] ?? r.plan) === r.plan ? 0.45 : 1,
                    }}
                  >
                    Set
                  </button>
                  <button
                    className="hv-danger"
                    disabled={busy === r.id}
                    onClick={() => void deleteOrg(r)}
                    title="Delete organization"
                    style={sx('border:none;background:transparent;color:var(--danger);font-size:15px;cursor:pointer;padding:4px')}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div style={sx('padding:26px;text-align:center;font-size:13px;color:var(--muted)')}>No organizations yet.</div>
            )}
          </div>
        </div>
        <div style={sx('margin-top:12px;font-size:11.5px;color:var(--muted)')}>
          Plan changes here don't create invoices — customers pay through the app. Deleting an organization removes its logins, board state, and invoice records permanently.
        </div>
        </>)}
      </div>
    </div>
  )
}
