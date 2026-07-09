import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { IconPlus, IconTrash } from '../components/icons'

export function Notes() {
  const store = useStore()
  const { state } = store
  const active = state.notes.find((n) => n.id === state.activeNoteId)

  return (
    <div style={sx('max-width:1000px;margin:0 auto')}>
      <div data-m="noteswrap" style={sx('display:grid;grid-template-columns:300px 1fr;gap:18px;align-items:start;height:calc(100vh - 210px);min-height:440px')}>
        <div data-m="noteslist" style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;height:100%;overflow:hidden')}>
          <button
            className="hv-border-accent"
            onClick={store.newNote}
            style={sx('display:flex;align-items:center;justify-content:center;gap:7px;border:1px dashed var(--line);background:var(--bg);color:var(--brand);font-size:13px;font-weight:600;padding:10px;border-radius:10px;cursor:pointer;margin-bottom:10px')}
          >
            <IconPlus /> New note
          </button>
          <div style={sx('overflow:auto;display:flex;flex-direction:column;gap:4px')}>
            {state.notes.map((n) => (
              <button
                key={n.id}
                className={state.activeNoteId === n.id ? undefined : 'hv-bg'}
                onClick={() => store.set({ activeNoteId: n.id })}
                style={{
                  ...sx('text-align:left;border:none;cursor:pointer;padding:11px 12px;border-radius:10px;width:100%'),
                  background: state.activeNoteId === n.id ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                <div style={sx('font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ink)')}>{n.title || 'Untitled note'}</div>
                <div style={sx('font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px')}>
                  {n.body.split('\n')[0].slice(0, 46) || 'No additional text'}
                </div>
                <div style={sx('font-size:10.5px;color:var(--muted);margin-top:4px')}>{n.updated}</div>
              </button>
            ))}
          </div>
        </div>

        <div data-m="noteeditor" style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;height:100%;overflow:hidden')}>
          {active ? (
            <>
              <div style={sx('padding:16px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px')}>
                <input
                  value={active.title}
                  onChange={(e) => store.updateNote('title', e.target.value)}
                  placeholder="Note title"
                  style={sx('flex:1;border:none;background:transparent;outline:none;font-family:Spectral,serif;font-size:19px;font-weight:600;color:var(--ink)')}
                />
                <span style={sx('font-size:11.5px;color:var(--muted);flex:none')}>{state.noteSaved}</span>
                <button
                  className="hv-warn-danger"
                  onClick={store.deleteNote}
                  title="Delete"
                  style={sx('border:none;background:transparent;color:var(--muted);cursor:pointer;padding:6px;border-radius:7px;display:flex')}
                >
                  <IconTrash />
                </button>
              </div>
              <textarea
                value={active.body}
                onChange={(e) => store.updateNote('body', e.target.value)}
                placeholder="Start typing…"
                style={sx('flex:1;border:none;background:transparent;outline:none;resize:none;padding:20px;font-size:14.5px;line-height:1.65;color:var(--ink)')}
              />
            </>
          ) : (
            <div style={sx('flex:1;display:grid;place-items:center;text-align:center;color:var(--muted);padding:40px')}>
              <div>
                <div style={sx('font-family:Spectral,serif;font-size:18px;color:var(--ink);margin-bottom:6px')}>No note selected</div>
                <div style={sx('font-size:13px')}>Pick a note on the left, or create a new one.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
