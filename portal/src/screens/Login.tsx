import { useState, type FormEvent } from 'react'
import { sx } from '../lib/sx'
import { useStore } from '../state/store'

const inputStyle = sx('width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:14px;color:var(--ink);outline:none')

export function Login() {
  const store = useStore()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const { loginError } = store.state

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void store.login(identifier, password, remember)
  }

  return (
    <div data-m="login" style={sx('min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr')}>
      <div data-m="loginbrand" style={sx('background:var(--brand);color:#fff;padding:56px 60px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden')}>
        <div style={sx('position:absolute;inset:0;background:radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.10), transparent 60%);pointer-events:none')} />
        <div style={sx('display:flex;align-items:center;gap:13px;position:relative')}>
          <div style={sx('width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);display:grid;place-items:center;font-family:Spectral,serif;font-size:20px;font-weight:600')}>A</div>
          <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:500;letter-spacing:.01em')}>Adams Infinite Legacy</div>
        </div>
        <div style={sx('position:relative;max-width:440px')}>
          <div style={sx('font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.72;margin-bottom:20px')}>Founder &amp; Board Portal</div>
          <div style={sx('font-family:Spectral,serif;font-size:40px;line-height:1.14;font-weight:500;letter-spacing:-.01em')}>Everything to launch the foundation, in one place.</div>
          <div style={sx('margin-top:22px;font-size:15px;line-height:1.6;opacity:.8')}>Track your formation checklist, sign governance documents through DocuSeal, schedule board meetings, and keep private notes — all secured to your account.</div>
        </div>
        <div style={sx('position:relative;display:flex;gap:26px;font-size:12.5px;opacity:.72')}>
          <span>California Nonprofit Public Benefit Corporation</span>
          <span>IRC § 501(c)(3)</span>
        </div>
      </div>
      <div data-m="loginform" style={sx('display:flex;align-items:center;justify-content:center;padding:40px')}>
        <form onSubmit={submit} style={sx('width:100%;max-width:372px')}>
          <div style={sx('font-family:Spectral,serif;font-size:27px;font-weight:500;letter-spacing:-.01em')}>Welcome back</div>
          <div style={sx('color:var(--muted);font-size:14px;margin-top:7px')}>Sign in to your Adams Infinite Legacy account.</div>

          <div style={sx('margin-top:30px;display:flex;flex-direction:column;gap:7px')}>
            <label style={sx('font-size:12.5px;font-weight:600;color:var(--ink)')}>Username or email</label>
            <input
              className="inp"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="username or email address"
              style={inputStyle}
            />
          </div>
          <div style={sx('margin-top:16px;display:flex;flex-direction:column;gap:7px')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:center')}>
              <label style={sx('font-size:12.5px;font-weight:600;color:var(--ink)')}>Password</label>
              <span style={sx('font-size:12px;color:var(--accent);cursor:pointer')}>Forgot?</span>
            </div>
            <input
              className="inp"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              style={inputStyle}
            />
          </div>

          {loginError && (
            <div style={sx('margin-top:14px;font-size:12.5px;color:var(--danger);background:var(--warn-soft);padding:9px 12px;border-radius:8px')}>{loginError}</div>
          )}

          <div style={sx('margin-top:18px;display:flex;align-items:center;gap:9px;font-size:13px;color:var(--muted)')}>
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              style={sx('width:15px;height:15px;accent-color:var(--brand)')}
            />
            <span>Keep me signed in on this device</span>
          </div>

          <button
            type="submit"
            className="hv-bright"
            style={sx('margin-top:24px;width:100%;padding:13px;border:none;border-radius:10px;background:var(--brand);color:#fff;font-size:14.5px;font-weight:600;cursor:pointer;transition:filter .15s')}
          >
            Sign in
          </button>

          <div style={sx('margin-top:18px;padding:12px 14px;background:var(--accent-soft);border-radius:9px;font-size:12px;color:var(--brand);line-height:1.5')}>
            <strong>Demo:</strong> sign in with any board member's username (e.g. <code>alitalia</code> or <code>judy.adams</code>) and any password. Production replaces this with real credentials &amp; 2FA.
          </div>
        </form>
      </div>
    </div>
  )
}
