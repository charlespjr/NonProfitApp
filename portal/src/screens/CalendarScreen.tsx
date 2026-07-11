import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { GoogleG, IconCalendar, IconZoom } from '../components/icons'
import type { Meeting } from '../types'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
/** July 2026: the 1st falls on a Wednesday → 3 leading blanks. */
const LEAD = 3
const DAYS = 31

/** Boards live on different calendars — offer the common ones plus an
 *  ICS feed any calendar app can subscribe to. */
const CAL_PROVIDERS: Array<{ id: string; name: string; letter: string; color: string; hint: string }> = [
  { id: 'google', name: 'Google Calendar', letter: 'G', color: '#ea4335', hint: 'Sign in with the Google account your foundation uses.' },
  { id: 'microsoft', name: 'Outlook / Microsoft 365', letter: 'M', color: '#0078d4', hint: 'Sign in with your Microsoft work or personal account.' },
  { id: 'apple', name: 'Apple iCloud Calendar', letter: '', color: '#111111', hint: 'Subscribe from iPhone, iPad, or Mac — meetings appear in the Calendar app.' },
  { id: 'ics', name: 'Other calendar (ICS feed)', letter: '@', color: 'var(--accent)', hint: 'Any calendar app that accepts an ICS subscription link works.' },
]

export function CalendarScreen() {
  const store = useStore()
  const { state } = store

  if (!state.calConnected) {
    return (
      <div style={sx('max-width:1080px;margin:0 auto')}>
        <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:44px 30px;text-align:center;max-width:520px;margin:40px auto')}>
          <div style={sx('width:58px;height:58px;border-radius:14px;background:var(--bg);border:1px solid var(--line);display:grid;place-items:center;margin:0 auto 18px')}>
            <IconCalendar size={28} stroke="var(--accent)" />
          </div>
          <div style={sx('font-family:Spectral,serif;font-size:20px;font-weight:600')}>Connect your calendar</div>
          <div style={sx('font-size:13.5px;color:var(--muted);margin-top:8px;line-height:1.55')}>
            Board meetings, votes, and filing deadlines sync to the calendar your organization already uses. Pick yours:
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:9px;margin-top:20px;text-align:left')}>
            {CAL_PROVIDERS.map((p) => (
              <button
                key={p.id}
                className="hv-border-accent-shadow"
                onClick={() => store.connectCal(p.id, p.name)}
                style={sx('display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:13.5px;font-weight:600;padding:11px 15px;border-radius:11px;cursor:pointer;width:100%;text-align:left')}
              >
                {p.id === 'google' ? (
                  <span style={sx('width:26px;height:26px;border-radius:7px;background:var(--bg);border:1px solid var(--line);display:grid;place-items:center;flex:none')}><GoogleG size={15} /></span>
                ) : (
                  <span style={{ ...sx('width:26px;height:26px;border-radius:7px;color:#fff;display:grid;place-items:center;flex:none;font-weight:800;font-size:13px'), background: p.color }}>{p.letter}</span>
                )}
                <span style={sx('flex:1;min-width:0')}>
                  {p.name}
                  <span style={sx('display:block;font-size:11.5px;font-weight:500;color:var(--muted);margin-top:1px')}>{p.hint}</span>
                </span>
                <span aria-hidden style={sx('color:var(--muted)')}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const calProvider = CAL_PROVIDERS.find((p) => p.id === state.calProvider)

  const meetings = store.meetingsView()
  const meetingByDay: Record<number, Meeting> = {}
  store.allMeetings().forEach((m) => (meetingByDay[m.day] = m))

  return (
    <div style={sx('max-width:1080px;margin:0 auto')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px')}>
        <div style={sx('display:flex;align-items:center;gap:10px;flex-wrap:wrap')}>
          <div style={sx('font-family:Spectral,serif;font-size:22px;font-weight:600')}>July 2026</div>
          <div style={sx('display:flex;align-items:center;gap:7px;background:var(--good-soft);color:var(--good);font-size:12px;font-weight:600;padding:5px 11px;border-radius:20px')}>
            {(!calProvider || calProvider.id === 'google') && <span style={{ display: 'flex' }}><GoogleG size={14} /></span>}
            {(calProvider?.name || 'Google Calendar') + ' connected'}
          </div>
          <button
            className="hv-danger"
            onClick={store.disconnectCal}
            style={sx('border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer')}
          >
            Disconnect
          </button>
          {state.zoomConnected ? (
            <div style={sx('display:flex;align-items:center;gap:7px;background:#e7f1ff;color:#2160c4;font-size:12px;font-weight:600;padding:5px 11px;border-radius:20px')}>
              <IconZoom size={14} /> Zoom connected
            </div>
          ) : (
            <button
              className="hv-zoom"
              onClick={store.connectZoom}
              style={sx('display:flex;align-items:center;gap:7px;border:1px solid #2D8CFF;background:var(--panel);color:#2160c4;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;cursor:pointer')}
            >
              <IconZoom size={14} /> Connect Zoom
            </button>
          )}
        </div>
        <div style={sx('display:flex;align-items:center;gap:12px')}>
          {state.zoomConnected && (
            <button className="hv-danger" onClick={store.disconnectZoom} style={sx('border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer')}>
              Disconnect Zoom
            </button>
          )}
          <div style={sx('font-size:12.5px;color:var(--muted)')}>
            {store.mode === 'api' ? store.apiMe?.email || '' : 'alitalia@adamsinfinitelegacy.org'}
          </div>
        </div>
      </div>

      <div data-m="calwrap" style={sx('display:grid;grid-template-columns:1fr 300px;gap:18px;align-items:start')}>
        <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden')}>
          <div style={sx('display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--line)')}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={sx('text-align:center;padding:11px 0;font-size:11px;letter-spacing:.05em;color:var(--muted);font-weight:600')}>{w}</div>
            ))}
          </div>
          <div data-m="calmonth" style={sx('display:grid;grid-template-columns:repeat(7,1fr)')}>
            {Array.from({ length: LEAD }, (_, i) => (
              <div key={'lead' + i} style={sx('min-height:96px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg)')} />
            ))}
            {Array.from({ length: DAYS }, (_, i) => {
              const d = i + 1
              const m = meetingByDay[d]
              const today = d === 1
              return (
                <div
                  key={d}
                  style={{
                    ...sx('min-height:96px;padding:7px 8px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)'),
                    ...(today ? { background: 'var(--accent-soft)' } : {}),
                  }}
                >
                  <div
                    style={sx(
                      today
                        ? 'width:24px;height:24px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:12.5px;font-weight:700'
                        : 'font-size:12.5px;color:var(--muted);font-weight:600;padding:2px',
                    )}
                  >
                    {d}
                  </div>
                  {m && (
                    <div style={sx('margin-top:6px;background:var(--accent);color:#fff;font-size:10.5px;font-weight:600;padding:4px 6px;border-radius:6px;line-height:1.25')}>
                      {m.time.replace(':00', '')} {m.title}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px')}>
          <div style={sx('font-family:Spectral,serif;font-size:15px;font-weight:600;margin-bottom:14px')}>This month</div>
          <div style={sx('display:flex;flex-direction:column;gap:14px')}>
            {meetings.map((m) => (
              <div key={m.id} style={sx('display:flex;gap:12px')}>
                <div style={sx('width:4px;border-radius:4px;background:var(--accent);flex:none')} />
                <div style={sx('min-width:0;flex:1')}>
                  <div style={sx('font-size:13.5px;font-weight:600')}>{m.title}</div>
                  <div style={sx('font-size:12px;color:var(--muted);margin-top:2px')}>Jul {m.day} · {m.time}</div>
                  <div style={sx('font-size:12px;color:var(--muted)')}>{m.who}</div>
                  {m.zoom && state.zoomConnected && (
                    <a
                      className="hv-bright"
                      href={m.zoomUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={sx('display:inline-flex;align-items:center;gap:6px;margin-top:7px;text-decoration:none;background:#2D8CFF;color:#fff;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:7px')}
                    >
                      <IconZoom />
                      Join Zoom
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            className="hv-border-danger"
            onClick={store.disconnectCal}
            style={sx('margin-top:18px;width:100%;border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:12.5px;font-weight:600;padding:9px;border-radius:9px;cursor:pointer')}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}
