import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { BASE_DOCS, PHASES, TASK_HELP } from '../data/seed'
import { IconCheck } from '../components/icons'
import { ProgressRing } from '../components/shared'

export function Checklist() {
  const store = useStore()
  const { state } = store

  let done = 0
  let total = 0
  PHASES.forEach((p) => p.items.forEach((t) => { total++; if (state.tasks[t.id]) done++ }))
  const progressPct = Math.round((done / total) * 100) || 0

  return (
    <div style={sx('max-width:820px;margin:0 auto')}>
      <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px;margin-bottom:20px;display:flex;align-items:center;gap:20px')}>
        <ProgressRing pct={progressPct} size={64} hole={66} fontSize={16} />
        <div style={{ flex: 1 }}>
          <div style={sx('font-family:Spectral,serif;font-size:19px;font-weight:600')}>Foundation launch checklist</div>
          <div style={sx('font-size:13.5px;color:var(--muted);margin-top:3px')}>
            {done} of {total} steps complete across formation, governance, compliance, and fundraising.
          </div>
        </div>
      </div>

      {PHASES.map((p) => {
        const phaseDone = p.items.filter((t) => state.tasks[t.id]).length
        return (
          <div key={p.name} style={sx('margin-bottom:18px')}>
            <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:0 2px')}>
              <div style={sx('font-family:Spectral,serif;font-size:15px;font-weight:600')}>{p.name}</div>
              <div style={sx('font-size:11.5px;color:var(--muted);background:var(--bg);border:1px solid var(--line);padding:2px 9px;border-radius:20px')}>
                {phaseDone}/{p.items.length}
              </div>
            </div>
            <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden')}>
              {p.items.map((t) => {
                const on = !!state.tasks[t.id]
                const doc = t.doc ? BASE_DOCS.find((d) => d.id === t.doc) : undefined
                return (
                  <div key={t.id} className="hv-row" style={sx('display:flex;align-items:flex-start;gap:13px;padding:14px 18px;border-bottom:1px solid var(--line)')}>
                    <button
                      className={on ? undefined : 'hv-border-accent'}
                      aria-label={(on ? 'Mark incomplete: ' : 'Mark complete: ') + store.brand(t.label)}
                      onClick={() => store.toggleTask(t.id)}
                      style={sx(
                        on
                          ? 'width:22px;height:22px;border-radius:7px;border:none;background:var(--accent);display:grid;place-items:center;cursor:pointer;flex:none'
                          : 'width:22px;height:22px;border-radius:7px;border:1.8px solid var(--line);background:var(--panel);cursor:pointer;flex:none',
                      )}
                    >
                      {on && <IconCheck />}
                    </button>
                    <div style={sx('flex:1;min-width:0')}>
                      <div style={{ ...sx('font-size:14px;font-weight:600;color:var(--ink)'), ...(on ? sx('text-decoration:line-through;opacity:.5') : {}) }}>{store.brand(t.label)}</div>
                      <div style={{ ...sx('font-size:12.5px;line-height:1.5;color:var(--muted);margin-top:3px'), ...(on ? { opacity: 0.5 } : {}) }}>{store.brand(TASK_HELP[t.id] || '')}</div>
                      {doc && (
                        <div style={sx('font-size:11.5px;color:var(--accent);font-weight:600;margin-top:4px')}>Linked document · {store.brand(doc.name)}</div>
                      )}
                    </div>
                    {doc && (
                      <button
                        className="hv-border-accent"
                        onClick={() => store.openModal(doc.id)}
                        style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12px;font-weight:600;padding:7px 12px;border-radius:8px;cursor:pointer;flex:none;margin-top:1px')}
                      >
                        Open
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
