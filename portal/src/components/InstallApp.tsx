import { useEffect, useState } from 'react'
import { sx } from '../lib/sx'
import { ModalShell } from './shared'
import { canPrompt, isIOS, isStandalone, onInstallChange, promptInstall } from '../lib/install'

const step = sx('display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px;line-height:1.55;color:var(--ink)')
const num = sx('flex:none;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center;margin-top:1px')

/**
 * "Install app" button + install dialog. On Chrome/Edge/Android the button
 * fires the real one-tap install prompt; elsewhere (iPhone Safari) it opens
 * guided steps. Arriving with ?install=1 (the marketing site's Install
 * button) opens the dialog automatically.
 */
export function InstallApp({ variant }: { variant: 'login' | 'sidebar' }) {
  const [, bump] = useState(0)
  const [open, setOpen] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => onInstallChange(() => bump((n) => n + 1)), [])
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('install') && !isStandalone()) setOpen(true)
  }, [])

  if (isStandalone()) return null

  const nativeInstall = async () => {
    if (await promptInstall()) {
      setInstalled(true)
      setOpen(false)
    }
  }

  const onClick = () => {
    if (canPrompt()) void nativeInstall()
    else setOpen(true)
  }

  if (installed) {
    return (
      <div style={sx('display:flex;align-items:center;justify-content:center;gap:7px;font-size:12.5px;color:var(--good);font-weight:600;padding:8px 0')}>
        ✓ Installed — find Quorum on your home screen
      </div>
    )
  }

  return (
    <>
      {variant === 'login' ? (
        <button
          type="button"
          data-m="installbtn"
          className="hv-border-accent"
          onClick={onClick}
          style={sx('margin-top:14px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--brand);font-size:13px;font-weight:600;cursor:pointer')}
        >
          <span aria-hidden>📲</span> Install the app on this device
        </button>
      ) : (
        <button
          type="button"
          data-m="installbtn"
          className="hv-soft"
          onClick={onClick}
          style={sx('display:flex;align-items:center;gap:12px;width:100%;border:none;cursor:pointer;padding:10px 12px;border-radius:9px;font-size:13px;font-weight:600;background:transparent;color:var(--brand)')}
        >
          <span aria-hidden style={sx('width:18px;text-align:center')}>📲</span> Install app
        </button>
      )}

      {open && (
        <ModalShell onClose={() => setOpen(false)} maxWidth={440}>
          <div style={sx('display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line)')}>
            <div style={sx('width:34px;height:34px;border-radius:9px;background:var(--brand);color:#fff;display:grid;place-items:center;font-family:Spectral,serif;font-size:17px;font-weight:600;flex:none')}>Q</div>
            <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600;flex:1')}>Install Quorum on this device</div>
            <button type="button" className="hv-bg" onClick={() => setOpen(false)} style={sx('border:none;background:transparent;color:var(--muted);cursor:pointer;padding:6px;border-radius:7px;font-size:18px;line-height:1')}>×</button>
          </div>
          <div style={sx('padding:20px')}>
            {canPrompt() ? (
              <>
                <div style={sx('font-size:13.5px;color:var(--muted);line-height:1.55')}>
                  One tap: Quorum gets its own icon and opens full screen — no app store, updates arrive automatically.
                </div>
                <button
                  type="button"
                  className="hv-bright"
                  onClick={() => void nativeInstall()}
                  style={sx('margin-top:16px;width:100%;padding:13px;border:none;border-radius:10px;background:var(--brand);color:#fff;font-size:14.5px;font-weight:600;cursor:pointer')}
                >
                  Install now
                </button>
              </>
            ) : isIOS() ? (
              <>
                <div style={sx('font-size:13.5px;color:var(--muted);line-height:1.55')}>
                  Apple only allows installs through Safari's share menu — two taps and it's on your home screen:
                </div>
                <div style={sx('margin-top:8px')}>
                  <div style={step}><span style={num}>1</span><span>Tap the <strong>Share</strong> button — the square with the up arrow at the bottom of Safari.</span></div>
                  <div style={step}><span style={num}>2</span><span>Scroll down and tap <strong>“Add to Home Screen,”</strong> then <strong>Add</strong>.</span></div>
                  <div style={{ ...step, borderBottom: 'none' }}><span style={num}>3</span><span>Open <strong>Quorum</strong> from your home screen and sign in once.</span></div>
                </div>
              </>
            ) : (
              <>
                <div style={sx('font-size:13.5px;color:var(--muted);line-height:1.55')}>
                  Your browser hasn't offered the one-tap install here, but it's still quick:
                </div>
                <div style={sx('margin-top:8px')}>
                  <div style={step}><span style={num}>1</span><span><strong>Android:</strong> open the <strong>⋮ menu</strong> in Chrome and tap <strong>“Install app”</strong> (or “Add to Home screen”).</span></div>
                  <div style={step}><span style={num}>2</span><span><strong>Computer:</strong> in Chrome or Edge, click the <strong>install icon</strong> at the right end of the address bar.</span></div>
                  <div style={{ ...step, borderBottom: 'none' }}><span style={num}>3</span><span>Quorum opens full screen with its own icon — same login, same live portal.</span></div>
                </div>
              </>
            )}
          </div>
        </ModalShell>
      )}
    </>
  )
}
