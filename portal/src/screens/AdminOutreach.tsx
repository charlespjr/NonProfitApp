import { useCallback, useEffect, useState } from 'react'
import { sx } from '../lib/sx'

interface Lead {
  id: string
  orgName: string
  email: string
  state: string | null
  city: string | null
  ntee: string | null
  website: string | null
  source: string | null
  status: string
  lastEmailedAt: string | null
  createdAt: string
}
interface Actor { key: string; label: string; findsEmails: boolean }
interface LeadsResp {
  leads: Lead[]
  counts: Record<string, number>
  actors: Actor[]
  apifyConfigured: boolean
  sendConfigured: boolean
  template: { subject: string; body: string }
}

const STATUS_CSS: Record<string, string> = {
  new: 'background:var(--bg);color:var(--muted);border:1px solid var(--line)',
  emailed: 'background:var(--accent-soft);color:var(--brand)',
  replied: 'background:var(--good-soft);color:var(--good)',
  unsubscribed: 'background:var(--warn-soft);color:var(--warn)',
  bounced: 'background:var(--warn-soft);color:var(--danger)',
}

/** Outreach CRM: discover nonprofit leads via Apify, then email them about
 *  Quorum with CAN-SPAM-compliant campaigns. Admin-key gated (key passed in). */
export function AdminOutreach({ adminKey }: { adminKey: string }) {
  const [data, setData] = useState<LeadsResp | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')

  // discover form
  const [source, setSource] = useState('emails')
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  // campaign
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showCompose, setShowCompose] = useState(false)

  // daily drip
  const [drip, setDrip] = useState<{ subject: string; body: string; dailyCap: number; active: boolean; lastRunAt: string | null; lastSentCount: number } | null>(null)
  const [queued, setQueued] = useState(0)
  const [dripSubject, setDripSubject] = useState('')
  const [dripBody, setDripBody] = useState('')
  const [dripCap, setDripCap] = useState(25)

  const hdr = { 'x-admin-key': adminKey }

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/outreach/leads', { headers: hdr })
      const body = (await res.json()) as LeadsResp
      setData(body)
      if (!subject && body.template) { setSubject(body.template.subject); setBody(body.template.body) }
    } catch {
      setError('Could not load leads.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey])

  const loadDrip = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/outreach/drip', { headers: hdr })
      const b = await res.json()
      setDrip(b.drip)
      setQueued(b.queued)
      if (b.drip) { setDripSubject(b.drip.subject); setDripBody(b.drip.body); setDripCap(b.drip.dailyCap) }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey])

  useEffect(() => { void load(); void loadDrip() }, [load, loadDrip])

  const discover = async () => {
    setBusy('discover'); setError(''); setNote('')
    try {
      const res = await fetch('/api/admin/outreach/discover', {
        method: 'POST', headers: { ...hdr, 'content-type': 'application/json' },
        body: JSON.stringify({ source, query, state: stateFilter, limit: 100 }),
      })
      const b = await res.json()
      if (!res.ok) { setError(b.error || 'Discovery failed'); return }
      setNote(`${b.sourceLabel}: found ${b.found}, ${b.withEmail} with email, ${b.added} new leads added.`)
      await load()
    } finally { setBusy('') }
  }

  const delLead = async (id: string) => {
    await fetch('/api/admin/outreach/leads/' + id, { method: 'DELETE', headers: hdr })
    setSelected((s) => { const n = new Set(s); n.delete(id); return n })
    await load()
  }

  const saveDrip = async (active: boolean) => {
    setBusy('drip'); setError(''); setNote('')
    try {
      const seedSubj = dripSubject || data?.template.subject || ''
      const seedBody = dripBody || data?.template.body || ''
      const res = await fetch('/api/admin/outreach/drip', {
        method: 'POST', headers: { ...hdr, 'content-type': 'application/json' },
        body: JSON.stringify({ subject: seedSubj, body: seedBody, dailyCap: dripCap, active }),
      })
      const b = await res.json()
      if (!res.ok) { setError(b.error || 'Could not save drip'); return }
      setNote(active ? `Daily drip is ON — up to ${dripCap} emails/day to new leads.` : 'Daily drip paused.')
      await loadDrip()
    } finally { setBusy('') }
  }

  const runDripNow = async () => {
    setBusy('driprun'); setError(''); setNote('')
    try {
      const res = await fetch('/api/outreach/drip-run', { method: 'POST', headers: hdr })
      const b = await res.json()
      if (!res.ok) { setError(b.error || 'Run failed'); return }
      setNote(b.skipped ? 'Drip is not active — turn it on first.' : `Drip ran: ${b.sent + (b.dryRun || 0)} email(s), ${b.remaining} still queued.`)
      await load(); await loadDrip()
    } finally { setBusy('') }
  }

  const send = async () => {
    setBusy('send'); setError(''); setNote('')
    try {
      const res = await fetch('/api/admin/outreach/send', {
        method: 'POST', headers: { ...hdr, 'content-type': 'application/json' },
        body: JSON.stringify({ subject, body, leadIds: [...selected] }),
      })
      const b = await res.json()
      if (!res.ok) { setError(b.error || 'Send failed'); return }
      setNote(
        b.mode === 'dryrun'
          ? `Dry run: ${b.dryRun} email(s) prepared (nothing sent — set RESEND_API_KEY to go live). ${b.skipped} skipped.`
          : `Sent ${b.sent} email(s). ${b.failed} failed, ${b.skipped} skipped (unsubscribed/no-email).`,
      )
      setSelected(new Set()); setShowCompose(false)
      await load()
    } finally { setBusy('') }
  }

  if (!data) return <div style={sx('padding:20px;color:var(--muted)')}>{error || 'Loading outreach…'}</div>

  const emailable = data.leads.filter((l) => l.status !== 'unsubscribed' && l.status !== 'bounced')
  const allSel = emailable.length > 0 && emailable.every((l) => selected.has(l.id))
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(emailable.map((l) => l.id)))

  return (
    <div>
      {/* config banners */}
      {!data.apifyConfigured && (
        <div style={sx('margin-bottom:12px;font-size:12.5px;color:var(--warn);background:var(--warn-soft);padding:9px 13px;border-radius:9px')}>
          Discovery is off until <strong>APIFY_TOKEN</strong> is set in Vercel. You can still write and preview campaigns.
        </div>
      )}
      {!data.sendConfigured && (
        <div style={sx('margin-bottom:12px;font-size:12.5px;color:var(--brand);background:var(--accent-soft);padding:9px 13px;border-radius:9px')}>
          Sending is in <strong>dry-run mode</strong> — set <strong>RESEND_API_KEY</strong> and <strong>OUTREACH_FROM</strong> in Vercel to deliver for real.
        </div>
      )}
      {error && <div style={sx('margin-bottom:12px;font-size:12.5px;color:var(--danger);background:var(--warn-soft);padding:9px 13px;border-radius:9px')}>{error}</div>}
      {note && <div style={sx('margin-bottom:12px;font-size:12.5px;color:var(--good);background:var(--good-soft);padding:9px 13px;border-radius:9px')}>{note}</div>}

      {/* discover */}
      <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-bottom:16px')}>
        <div style={sx('font-size:14px;font-weight:600;margin-bottom:10px')}>Find nonprofits</div>
        <div style={sx('display:flex;gap:8px;flex-wrap:wrap;align-items:end')}>
          <div style={sx('flex:2;min-width:200px')}>
            <label style={sx('font-size:11.5px;color:var(--muted);font-weight:600')}>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} style={sx('width:100%;margin-top:4px;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:13px;color:var(--ink)')}>
              {data.actors.map((a) => <option key={a.key} value={a.key}>{a.label}{a.findsEmails ? ' ✉' : ''}</option>)}
            </select>
          </div>
          <div style={sx('flex:2;min-width:160px')}>
            <label style={sx('font-size:11.5px;color:var(--muted);font-weight:600')}>Keyword / cause</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. youth education" style={sx('width:100%;margin-top:4px;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:13px;color:var(--ink)')} />
          </div>
          <div style={sx('flex:1;min-width:90px')}>
            <label style={sx('font-size:11.5px;color:var(--muted);font-weight:600')}>State</label>
            <input value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} placeholder="CA" style={sx('width:100%;margin-top:4px;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:13px;color:var(--ink)')} />
          </div>
          <button
            className="hv-bright"
            disabled={busy === 'discover'}
            onClick={() => void discover()}
            style={sx('border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:10px 18px;border-radius:9px;cursor:pointer')}
          >
            {busy === 'discover' ? 'Searching…' : 'Discover'}
          </button>
        </div>
        <div style={sx('font-size:11.5px;color:var(--muted);margin-top:8px;line-height:1.5')}>
          Tip: the IRS/990 sources find organizations; the <strong>Charity Email Scraper ✉</strong> finds their email addresses. Only leads with an email are stored.
        </div>
      </div>

      {/* daily drip */}
      <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-bottom:16px')}>
        <div style={sx('display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px')}>
          <div style={sx('font-size:14px;font-weight:600')}>Daily drip</div>
          {drip?.active ? (
            <span style={sx('font-size:11px;font-weight:700;color:var(--good);background:var(--good-soft);padding:3px 10px;border-radius:20px')}>ON · up to {drip.dailyCap}/day</span>
          ) : (
            <span style={sx('font-size:11px;font-weight:700;color:var(--muted);background:var(--bg);border:1px solid var(--line);padding:3px 10px;border-radius:20px')}>Paused</span>
          )}
          <span style={sx('font-size:11.5px;color:var(--muted)')}>{queued} new lead{queued === 1 ? '' : 's'} queued{drip?.lastRunAt ? ` · last run sent ${drip.lastSentCount}` : ''}</span>
        </div>
        <div style={sx('font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px')}>
          Sends this message to the next batch of never-contacted leads automatically every morning — a steady drip protects your sending reputation. Same unsubscribe + address footer as manual sends.
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:10px')}>
          <input value={dripSubject} onChange={(e) => setDripSubject(e.target.value)} placeholder="Subject — {{orgName}} merges the org name" style={sx('width:100%;padding:9px 12px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:13px;color:var(--ink)')} />
          <textarea value={dripBody} onChange={(e) => setDripBody(e.target.value)} placeholder="Email body (HTML). Leave blank to use the default template." style={sx('width:100%;min-height:110px;resize:vertical;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:12px;line-height:1.5;color:var(--ink);font-family:ui-monospace,monospace')} />
          <div style={sx('display:flex;gap:10px;align-items:center;flex-wrap:wrap')}>
            <label style={sx('font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:7px')}>
              Send up to
              <input type="number" min={1} max={500} value={dripCap} onChange={(e) => setDripCap(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} style={sx('width:70px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:var(--bg);font-size:13px;color:var(--ink)')} />
              per day
            </label>
            <div style={sx('flex:1')} />
            <button className="hv-bg" disabled={busy === 'driprun'} onClick={() => void runDripNow()} style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer')}>Run today’s batch now</button>
            {drip?.active ? (
              <button className="hv-border-danger" disabled={busy === 'drip'} onClick={() => void saveDrip(false)} style={sx('border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer')}>Pause drip</button>
            ) : (
              <button className="hv-bright" disabled={busy === 'drip'} onClick={() => void saveDrip(true)} style={sx('border:none;background:var(--brand);color:#fff;font-size:12.5px;font-weight:600;padding:8px 16px;border-radius:9px;cursor:pointer')}>Turn on daily drip</button>
            )}
            {drip?.active && (
              <button className="hv-bg" disabled={busy === 'drip'} onClick={() => void saveDrip(true)} style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer')}>Save changes</button>
            )}
          </div>
        </div>
      </div>

      {/* leads */}
      <div style={sx('display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px')}>
        <div style={sx('font-size:14px;font-weight:600')}>Leads ({data.leads.length})</div>
        {Object.entries(data.counts).map(([s, n]) => (
          <span key={s} style={{ ...sx('font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px'), ...sx(STATUS_CSS[s] || STATUS_CSS.new) }}>{n} {s}</span>
        ))}
        <div style={sx('flex:1')} />
        {selected.size > 0 && (
          <button
            className="hv-bright"
            onClick={() => setShowCompose(true)}
            style={sx('border:none;background:var(--brand);color:#fff;font-size:12.5px;font-weight:600;padding:8px 15px;border-radius:9px;cursor:pointer')}
          >
            Email {selected.size} selected →
          </button>
        )}
      </div>

      <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow-x:auto')}>
        <div style={sx('min-width:820px')}>
          <div style={sx('display:grid;grid-template-columns:38px minmax(0,1.4fr) minmax(0,1.3fr) 130px 110px 90px;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line);font-size:11px;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;font-weight:600')}>
            <div><input type="checkbox" checked={allSel} onChange={toggleAll} /></div>
            <div>Organization</div><div>Email</div><div>Location</div><div>Status</div><div style={{ textAlign: 'right' }}>Remove</div>
          </div>
          {data.leads.map((l) => {
            const locked = l.status === 'unsubscribed' || l.status === 'bounced'
            return (
              <div key={l.id} className="hv-row" style={sx('display:grid;grid-template-columns:38px minmax(0,1.4fr) minmax(0,1.3fr) 130px 110px 90px;gap:10px;padding:11px 16px;border-bottom:1px solid var(--line);align-items:center')}>
                <div><input type="checkbox" disabled={locked} checked={selected.has(l.id)} onChange={(e) => setSelected((s) => { const n = new Set(s); e.target.checked ? n.add(l.id) : n.delete(l.id); return n })} /></div>
                <div style={sx('min-width:0')}>
                  <div style={sx('font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{l.orgName}</div>
                  {l.ntee && <div style={sx('font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{l.ntee}</div>}
                </div>
                <div style={sx('font-size:12.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{l.email}</div>
                <div style={sx('font-size:12px;color:var(--muted)')}>{[l.city, l.state].filter(Boolean).join(', ') || '—'}</div>
                <div><span style={{ ...sx('font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px'), ...sx(STATUS_CSS[l.status] || STATUS_CSS.new) }}>{l.status}</span></div>
                <div style={{ textAlign: 'right' }}>
                  <button className="hv-danger" onClick={() => void delLead(l.id)} style={sx('border:none;background:transparent;color:var(--danger);font-size:14px;cursor:pointer;padding:4px')}>🗑</button>
                </div>
              </div>
            )
          })}
          {data.leads.length === 0 && <div style={sx('padding:24px;text-align:center;font-size:13px;color:var(--muted)')}>No leads yet — run a discovery above.</div>}
        </div>
      </div>

      {/* composer */}
      {showCompose && (
        <div style={sx('position:fixed;inset:0;background:rgba(30,20,14,.5);z-index:100;display:grid;place-items:center;padding:20px')} onClick={() => setShowCompose(false)}>
          <div onClick={(e) => e.stopPropagation()} style={sx('background:var(--panel);border-radius:16px;max-width:640px;width:100%;max-height:88vh;overflow:auto')}>
            <div style={sx('display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line)')}>
              <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600;flex:1')}>Email {selected.size} organization{selected.size === 1 ? '' : 's'}</div>
              <button onClick={() => setShowCompose(false)} style={sx('border:none;background:transparent;color:var(--muted);font-size:20px;cursor:pointer')}>×</button>
            </div>
            <div style={sx('padding:20px;display:flex;flex-direction:column;gap:14px')}>
              <div>
                <label style={sx('font-size:12px;font-weight:600')}>Subject <span style={sx('color:var(--muted);font-weight:400')}>— {'{{orgName}}'} merges the org name</span></label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} style={sx('width:100%;margin-top:6px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:13.5px;color:var(--ink)')} />
              </div>
              <div>
                <label style={sx('font-size:12px;font-weight:600')}>Body <span style={sx('color:var(--muted);font-weight:400')}>— HTML; unsubscribe link &amp; mailing address are added automatically</span></label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} style={sx('width:100%;margin-top:6px;min-height:220px;resize:vertical;padding:11px 13px;border:1px solid var(--line);border-radius:9px;background:var(--bg);font-size:12.5px;line-height:1.6;color:var(--ink);font-family:ui-monospace,monospace')} />
              </div>
              <div style={sx('font-size:11.5px;color:var(--muted);line-height:1.5')}>
                Every email includes a one-click unsubscribe and your postal address (CAN-SPAM). Unsubscribed leads are skipped automatically.
              </div>
            </div>
            <div style={sx('padding:14px 20px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:10px')}>
              <button onClick={() => setShowCompose(false)} style={sx('border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:13px;font-weight:600;padding:9px 16px;border-radius:9px;cursor:pointer')}>Cancel</button>
              <button
                className="hv-bright"
                disabled={busy === 'send'}
                onClick={() => void send()}
                style={sx('border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:9px 18px;border-radius:9px;cursor:pointer')}
              >
                {busy === 'send' ? 'Sending…' : data.sendConfigured ? `Send to ${selected.size}` : `Preview send (dry run)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
