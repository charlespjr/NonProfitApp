import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { PHASES } from '../data/seed'
import { IconDocuments, IconZoom } from '../components/icons'
import { ProgressRing, STATUS_META } from '../components/shared'

const kpiCard = sx('background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px 17px')
const card = sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px')
const linkBtn = sx('border:none;background:transparent;color:var(--accent);font-size:12.5px;font-weight:600;cursor:pointer')

export function Dashboard() {
  const store = useStore()
  const { state, currentUser } = store
  const firstName = currentUser!.member.name.split(' ')[0]

  let done = 0
  let total = 0
  const flat: Array<{ id: string; label: string; phase: string }> = []
  PHASES.forEach((p) =>
    p.items.forEach((t) => {
      total++
      if (state.tasks[t.id]) done++
      flat.push({ id: t.id, label: t.label, phase: p.name })
    }),
  )
  const progressPct = Math.round((done / total) * 100) || 0
  const openTasks = total - done
  const nextTasks = flat.filter((t) => !state.tasks[t.id]).slice(0, 4)

  const docs = store.allDocs()
  const pendingSign = docs.filter((d) => store.docStatusOf(d) === 'sent').length
  const signedCount = docs.filter((d) => store.docStatusOf(d) === 'signed').length
  const recentDocs = docs.slice(0, 4)
  const upcoming = store.meetingsView().slice(0, 3)
  const next = upcoming[0]

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'

  const layoutGrid = state.dashboardLayout !== 'Two-column feed'

  return (
    <div style={sx('max-width:1180px;margin:0 auto')}>
      <div style={sx('display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:22px')}>
        <div>
          <div style={sx('font-family:Spectral,serif;font-size:28px;font-weight:500;letter-spacing:-.01em')}>
            {greeting}, {firstName}.
          </div>
          <div style={sx("color:var(--muted);font-size:14px;margin-top:5px")}>Here's where things stand with the foundation's launch.</div>
        </div>
        <div style={sx('display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:11px 16px')}>
          <ProgressRing pct={progressPct} size={44} hole={62} fontSize={12} />
          <div>
            <div style={sx('font-size:13px;font-weight:600')}>Launch progress</div>
            <div style={sx('font-size:12px;color:var(--muted)')}>
              {done} of {total} tasks complete
            </div>
          </div>
        </div>
      </div>

      <div data-m="kpi" style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px')}>
        <div style={kpiCard}>
          <div style={sx('font-size:12.5px;color:var(--muted)')}>Awaiting signature</div>
          <div style={sx('font-family:Spectral,serif;font-size:30px;font-weight:600;margin-top:6px;color:var(--warn)')}>{pendingSign}</div>
          <div style={sx('font-size:12px;color:var(--muted);margin-top:2px')}>documents in DocuSeal</div>
        </div>
        <div style={kpiCard}>
          <div style={sx('font-size:12.5px;color:var(--muted)')}>Signed</div>
          <div style={sx('font-family:Spectral,serif;font-size:30px;font-weight:600;margin-top:6px;color:var(--good)')}>{signedCount}</div>
          <div style={sx('font-size:12px;color:var(--muted);margin-top:2px')}>completed &amp; filed</div>
        </div>
        <div style={kpiCard}>
          <div style={sx('font-size:12.5px;color:var(--muted)')}>Open tasks</div>
          <div style={sx('font-family:Spectral,serif;font-size:30px;font-weight:600;margin-top:6px')}>{openTasks}</div>
          <div style={sx('font-size:12px;color:var(--muted);margin-top:2px')}>on launch checklist</div>
        </div>
        <div style={kpiCard}>
          <div style={sx('font-size:12.5px;color:var(--muted)')}>Next meeting</div>
          <div style={sx('font-family:Spectral,serif;font-size:20px;font-weight:600;margin-top:9px')}>{next ? 'Jul ' + next.day : '—'}</div>
          <div style={sx('font-size:12px;color:var(--muted);margin-top:3px')}>{next ? next.title : 'No meetings scheduled'}</div>
        </div>
      </div>

      <div
        data-m="dashbody"
        style={sx(
          layoutGrid
            ? 'display:grid;grid-template-columns:1.5fr 1fr;gap:18px;align-items:start'
            : 'display:grid;grid-template-columns:1fr 340px;gap:18px;align-items:start',
        )}
      >
        <div style={sx('display:flex;flex-direction:column;gap:18px;min-width:0')}>
          <div style={card}>
            <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:15px')}>
              <div style={sx('font-family:Spectral,serif;font-size:16px;font-weight:600')}>Launch checklist</div>
              <button onClick={() => store.go('checklist')} style={linkBtn}>View all →</button>
            </div>
            <div style={sx('height:8px;background:var(--bg);border-radius:20px;overflow:hidden;margin-bottom:16px')}>
              <div style={{ ...sx('height:100%;background:var(--accent);border-radius:20px;transition:width .3s'), width: progressPct + '%' }} />
            </div>
            <div style={sx('display:flex;flex-direction:column;gap:2px')}>
              {nextTasks.map((t) => (
                <button
                  key={t.id}
                  className="hv-bg"
                  aria-label={'Mark complete: ' + t.label}
                  onClick={() => store.toggleTask(t.id)}
                  style={sx('display:flex;align-items:center;gap:12px;text-align:left;border:none;background:transparent;cursor:pointer;padding:9px 8px;border-radius:9px;width:100%')}
                >
                  <span style={sx('width:22px;height:22px;border-radius:7px;border:1.8px solid var(--line);background:var(--panel);cursor:pointer;flex:none')} />
                  <span style={sx('flex:1;font-size:13.5px;color:var(--ink)')}>{t.label}</span>
                  <span style={sx('font-size:11px;color:var(--muted)')}>{t.phase}</span>
                </button>
              ))}
              {nextTasks.length === 0 && (
                <div style={sx('font-size:13px;color:var(--muted);padding:9px 8px')}>Every launch task is complete. 🎉</div>
              )}
            </div>
          </div>

          <div style={card}>
            <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:6px')}>
              <div style={sx('font-family:Spectral,serif;font-size:16px;font-weight:600')}>Recent documents</div>
              <button onClick={() => store.go('documents')} style={linkBtn}>Open library →</button>
            </div>
            {recentDocs.map((d) => {
              const st = store.docStatusOf(d)
              return (
                <div key={d.id} style={sx('display:flex;align-items:center;gap:14px;padding:12px 6px;border-bottom:1px solid var(--line)')}>
                  <span style={sx('width:34px;height:34px;border-radius:8px;background:var(--accent-soft);color:var(--brand);display:grid;place-items:center;flex:none')}>
                    <IconDocuments size={16} />
                  </span>
                  <div style={sx('flex:1;min-width:0')}>
                    <div style={sx('font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{d.name}</div>
                    <div style={sx('font-size:11.5px;color:var(--muted)')}>{d.cat} · Updated {d.updated}</div>
                  </div>
                  <span style={STATUS_META[st].style}>{STATUS_META[st].label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={sx('display:flex;flex-direction:column;gap:18px;min-width:0')}>
          <div style={card}>
            <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
              <div style={sx('font-family:Spectral,serif;font-size:16px;font-weight:600')}>Upcoming meetings</div>
              <button onClick={() => store.go('calendar')} style={linkBtn}>Calendar →</button>
            </div>
            <div style={sx('display:flex;flex-direction:column;gap:11px')}>
              {upcoming.map((m) => (
                <div key={m.id} style={sx('display:flex;gap:13px;align-items:center')}>
                  <div style={sx('width:46px;height:52px;border-radius:10px;background:var(--bg);border:1px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none')}>
                    <div style={sx('font-size:10px;letter-spacing:.08em;color:var(--danger);font-weight:700')}>JUL</div>
                    <div style={sx('font-family:Spectral,serif;font-size:20px;font-weight:600;line-height:1')}>{m.day}</div>
                  </div>
                  <div style={sx('min-width:0;flex:1')}>
                    <div style={sx('font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{m.title}</div>
                    <div style={sx('font-size:11.5px;color:var(--muted)')}>{m.time} · {m.who}</div>
                  </div>
                  {m.zoom && state.zoomConnected && (
                    <a
                      className="hv-bright"
                      href={m.zoomUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Join Zoom"
                      style={sx('display:inline-flex;align-items:center;gap:6px;text-decoration:none;background:#2D8CFF;color:#fff;font-size:11.5px;font-weight:600;padding:6px 11px;border-radius:8px;flex:none')}
                    >
                      <IconZoom />
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
