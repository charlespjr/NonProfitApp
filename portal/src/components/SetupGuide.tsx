import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { InstallApp } from './InstallApp'
import { isStandalone } from '../lib/install'

interface Step {
  key: string
  title: string
  desc: string
  done: boolean
  cta: string
  go: () => void
}

/**
 * "Get set up" — the step-by-step onboarding checklist a freshly registered
 * organization sees on its dashboard: pick a plan, connect the email
 * provider, invite the board, hook up Calendar/Zoom, send the first document
 * to DocuSeal, install the app. Each step knows whether it's actually done
 * and jumps straight to where it happens. Admins only; dismissable.
 */
export function SetupGuide() {
  const store = useStore()
  const { state } = store

  if (store.mode !== 'api' || !store.currentUser?.isAdmin || state.setupDismissed) return null

  const steps: Step[] = [
    {
      key: 'plan',
      title: 'Pick your plan',
      desc: 'The free preview is read-only — a plan unlocks changes, member logins, and documents.',
      done: !store.locked,
      cta: 'Choose plan',
      go: () => store.set({ screen: 'team', upgradeOpen: true }),
    },
    {
      key: 'email',
      title: 'Connect your foundation email',
      desc: 'Pick your provider (Google, Microsoft 365, Zoho…) so DocuSeal invitations and vote emails send from your address.',
      done: state.emailConnected,
      cta: 'Set up email',
      go: () => store.go('team'),
    },
    {
      key: 'board',
      title: 'Invite your board',
      desc: 'Give each director a login with Vote and Sign permissions — they only need a personal email.',
      done: store.roster().length > 1,
      cta: 'Add members',
      go: () => store.go('team'),
    },
    {
      key: 'calendar',
      title: 'Connect Google Calendar',
      desc: 'Board meetings and filing deadlines land on one calendar with reminders.',
      done: state.calConnected,
      cta: 'Connect',
      go: () => store.go('calendar'),
    },
    {
      key: 'zoom',
      title: 'Connect Zoom',
      desc: 'Every new motion schedules its own Zoom discussion automatically.',
      done: state.zoomConnected,
      cta: 'Connect',
      go: () => store.go('calendar'),
    },
    {
      key: 'docuseal',
      title: 'Send your first document for signature',
      desc: 'Open any document in the library and route it to the board through DocuSeal.',
      done:
        Object.keys(state.sig).length > 0 ||
        Object.keys(state.docNotified).length > 0 ||
        state.customDocs.length > 0,
      cta: 'Open documents',
      go: () => store.go('documents'),
    },
    {
      key: 'app',
      title: 'Install the app on your phone',
      desc: 'One tap from your browser — no app store. Your board can install it too.',
      done: isStandalone(),
      cta: '',
      go: () => {},
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  return (
    <div data-m="setupguide" style={sx('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin-bottom:20px')}>
      <div style={sx('display:flex;align-items:center;gap:12px;flex-wrap:wrap')}>
        <div style={sx('flex:1;min-width:220px')}>
          <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600')}>
            {allDone ? 'You’re fully set up 🎉' : 'Get ' + store.orgName + ' set up'}
          </div>
          <div style={sx('font-size:12.5px;color:var(--muted);margin-top:2px')}>
            {allDone
              ? 'Every connection is live — your board portal is ready to run.'
              : 'A few connections make the portal whole. Do them in any order.'}
          </div>
        </div>
        <div style={sx('display:flex;align-items:center;gap:12px')}>
          <div style={sx('font-size:12px;font-weight:700;color:var(--brand);background:var(--accent-soft);padding:4px 11px;border-radius:20px')}>
            {doneCount} of {steps.length} done
          </div>
          <button
            onClick={() => store.set({ setupDismissed: true })}
            style={sx('border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:4px')}
          >
            Hide
          </button>
        </div>
      </div>
      <div style={sx('height:6px;background:var(--bg);border-radius:20px;overflow:hidden;margin:14px 0 6px')}>
        <div style={{ ...sx('height:100%;background:var(--good);border-radius:20px;transition:width .3s'), width: Math.round((doneCount / steps.length) * 100) + '%' }} />
      </div>
      <div style={sx('display:flex;flex-direction:column')}>
        {steps.map((s, i) => (
          <div key={s.key} style={sx('display:flex;align-items:center;gap:13px;padding:11px 2px;border-bottom:1px solid var(--line)' + (i === steps.length - 1 ? ';border-bottom:none' : ''))}>
            <span
              style={{
                ...sx('flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:800'),
                ...(s.done
                  ? sx('background:var(--good);color:#fff')
                  : sx('background:var(--bg);border:1.8px solid var(--line);color:var(--muted)')),
              }}
            >
              {s.done ? '✓' : i + 1}
            </span>
            <div style={sx('flex:1;min-width:0')}>
              <div style={{ ...sx('font-size:13.5px;font-weight:600'), ...(s.done ? { opacity: 0.55 } : {}) }}>{s.title}</div>
              {!s.done && <div style={sx('font-size:12px;color:var(--muted);line-height:1.45;margin-top:1px')}>{s.desc}</div>}
            </div>
            {s.done ? (
              <span style={sx('font-size:11.5px;font-weight:600;color:var(--good);flex:none')}>Done</span>
            ) : s.key === 'app' ? (
              <div style={sx('flex:none')}><InstallApp variant="sidebar" /></div>
            ) : (
              <button
                className="hv-border-accent"
                onClick={s.go}
                style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12px;font-weight:600;padding:7px 13px;border-radius:8px;cursor:pointer;flex:none')}
              >
                {s.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
