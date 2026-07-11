import { useState, type FormEvent } from 'react'
import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { InstallApp } from '../components/InstallApp'

const inputStyle = sx('width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:14px;color:var(--ink);outline:none')
const labelStyle = sx('font-size:12.5px;font-weight:600;color:var(--ink)')
const fieldStyle = sx('margin-top:16px;display:flex;flex-direction:column;gap:7px')

export function Login() {
  const store = useStore()
  const [view, setView] = useState<'signin' | 'register'>('signin')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const { loginError } = store.state
  const apiMode = store.mode === 'api'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (view === 'register') {
      void store.register({ orgName, name, email, username, password })
    } else {
      void store.login(identifier, password, remember)
    }
  }

  const switchView = (v: 'signin' | 'register') => {
    setView(v)
    store.set({ loginError: '' })
  }

  return (
    <div data-m="login" style={sx('min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr')}>
      <div data-m="loginbrand" style={sx('background:var(--brand);color:#fff;padding:56px 60px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden')}>
        <div style={sx('position:absolute;inset:0;background:radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.10), transparent 60%);pointer-events:none')} />
        <div style={sx('display:flex;align-items:center;gap:13px;position:relative')}>
          <div style={sx('width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);display:grid;place-items:center;font-family:Spectral,serif;font-size:20px;font-weight:600')}>Q</div>
          <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:500;letter-spacing:.01em')}>Quorum — The Nonprofit Board OS</div>
        </div>
        <div style={sx('position:relative;max-width:440px')}>
          <div style={sx('font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.72;margin-bottom:20px')}>Founder &amp; Board Portal</div>
          <div style={sx('font-family:Spectral,serif;font-size:40px;line-height:1.14;font-weight:500;letter-spacing:-.01em')}>Everything to launch the foundation, in one place.</div>
          <div style={sx('margin-top:22px;font-size:15px;line-height:1.6;opacity:.8')}>Track your formation checklist, sign governance documents through DocuSeal, schedule board meetings, and keep private notes — all secured to your organization's account.</div>
        </div>
        <div style={sx('position:relative;display:flex;gap:26px;font-size:12.5px;opacity:.72')}>
          <span>Built for nonprofit boards</span>
          <span>Form · Sign · Vote · Meet · Comply</span>
        </div>
      </div>
      <div data-m="loginform" style={sx('display:flex;align-items:center;justify-content:center;padding:40px')}>
        <form onSubmit={submit} style={sx('width:100%;max-width:372px')}>
          <div style={sx('font-family:Spectral,serif;font-size:27px;font-weight:500;letter-spacing:-.01em')}>
            {view === 'signin' ? 'Welcome back' : 'Create your foundation'}
          </div>
          <div style={sx('color:var(--muted);font-size:14px;margin-top:7px')}>
            {view === 'signin'
              ? 'Sign in to your organization’s portal.'
              : 'Set up your organization and your administrator account.'}
          </div>

          {view === 'register' ? (
            <>
              <div style={{ ...fieldStyle, marginTop: 26 }}>
                <label style={labelStyle}>Organization name</label>
                <input className="inp" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Adams Infinite Legacy" style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Your name</label>
                <input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Email</label>
                <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Username</label>
                <input className="inp" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. alitalia" style={{ ...inputStyle, fontFamily: 'ui-monospace,monospace' }} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Password <span style={sx('color:var(--muted);font-weight:400')}>(8+ characters)</span></label>
                <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" style={inputStyle} />
              </div>
            </>
          ) : (
            <>
              <div style={{ ...fieldStyle, marginTop: 30 }}>
                <label style={labelStyle}>Username or email</label>
                <input className="inp" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="username or email address" style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <div style={sx('display:flex;justify-content:space-between;align-items:center')}>
                  <label style={labelStyle}>Password</label>
                  <span style={sx('font-size:12px;color:var(--accent);cursor:pointer')}>Forgot?</span>
                </div>
                <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" style={inputStyle} />
              </div>
              <div style={sx('margin-top:18px;display:flex;align-items:center;gap:9px;font-size:13px;color:var(--muted)')}>
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} style={sx('width:15px;height:15px;accent-color:var(--brand)')} />
                <span>Keep me signed in on this device</span>
              </div>
            </>
          )}

          {loginError && (
            <div style={sx('margin-top:14px;font-size:12.5px;color:var(--danger);background:var(--warn-soft);padding:9px 12px;border-radius:8px')}>{loginError}</div>
          )}

          <button
            type="submit"
            className="hv-bright"
            style={sx('margin-top:24px;width:100%;padding:13px;border:none;border-radius:10px;background:var(--brand);color:#fff;font-size:14.5px;font-weight:600;cursor:pointer;transition:filter .15s')}
          >
            {view === 'signin' ? 'Sign in' : 'Create organization'}
          </button>

          {apiMode ? (
            <div style={sx('margin-top:18px;text-align:center;font-size:13px;color:var(--muted)')}>
              {view === 'signin' ? (
                <>New here?{' '}
                  <button type="button" onClick={() => switchView('register')} style={sx('border:none;background:transparent;color:var(--accent);font-weight:600;cursor:pointer;font-size:13px;padding:0')}>
                    Create your foundation →
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => switchView('signin')} style={sx('border:none;background:transparent;color:var(--accent);font-weight:600;cursor:pointer;font-size:13px;padding:0')}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={sx('margin-top:18px;padding:12px 14px;background:var(--accent-soft);border-radius:9px;font-size:12px;color:var(--brand);line-height:1.5')}>
              <strong>Demo:</strong> sign in with any board member's username (e.g. <code>alitalia</code> or <code>judy.adams</code>) and any password. The full product adds real accounts &amp; organizations.
            </div>
          )}

          <InstallApp variant="login" />
        </form>
      </div>
    </div>
  )
}
