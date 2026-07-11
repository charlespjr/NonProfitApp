import { useState } from 'react'
import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { DOC_INFO, MEETINGS } from '../data/seed'
import {
  IconCalendarSm,
  IconCheck,
  IconCheckSmall,
  IconClose,
  IconInfo,
  IconMailBrand,
  IconSparkleBrand,
  IconZoom,
} from '../components/icons'
import { Avatar, ModalShell, YouChip } from '../components/shared'

const closeBtnStyle = sx('border:none;background:transparent;color:var(--muted);cursor:pointer;padding:6px;border-radius:7px;display:flex')
const cancelBtnStyle = sx('border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:13px;font-weight:600;padding:9px 16px;border-radius:9px;cursor:pointer')
const fieldLabel = sx('font-size:12.5px;font-weight:600')
const fieldInput = sx('width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:14px;color:var(--ink);outline:none')

// ------------------------------------------------------------- DocuSeal
export function DocuSealModal() {
  const store = useStore()
  const { state, currentUser } = store
  const docId = state.modal
  if (!docId) return null
  const doc = store.allDocs().find((d) => d.id === docId)
  if (!doc) return null

  const rawInfo = DOC_INFO[doc.id] || { desc: doc.desc || '', todo: doc.todo || '' }
  const info = { desc: store.brand(rawInfo.desc), todo: store.brand(rawInfo.todo) }
  const roster = store.roster()
  const sig = store.sigFor(doc.id)
  const signedCount = roster.filter((m) => sig[m.id]).length
  const allSigned = signedCount >= roster.length
  const notified = state.docNotified[doc.id]
  const user = currentUser!

  return (
    <ModalShell onClose={store.closeModal} maxWidth={640}>
      <div style={sx('display:flex;align-items:center;gap:12px;padding:15px 20px;border-bottom:1px solid var(--line)')}>
        <div style={sx('width:30px;height:30px;border-radius:8px;background:#1a73e8;color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;flex:none')}>D</div>
        <div style={{ flex: 1 }}>
          <div style={sx('font-size:14px;font-weight:700')}>DocuSeal</div>
          <div style={sx('font-size:11.5px;color:var(--muted)')}>Secure electronic signature</div>
        </div>
        <button className="hv-bg" onClick={store.closeModal} style={closeBtnStyle}><IconClose /></button>
      </div>

      <div style={sx('padding:20px 22px;overflow:auto;background:var(--bg)')}>
        <div style={sx('background:#fff;border:1px solid var(--line);border-radius:8px;padding:22px 26px;box-shadow:0 2px 14px rgba(0,0,0,.06);color:#222;margin-bottom:16px')}>
          <div style={sx('text-align:center;font-family:Spectral,serif;font-size:12px;letter-spacing:.06em;color:#666;text-transform:uppercase')}>{store.orgName}</div>
          <div style={sx('text-align:center;font-family:Spectral,serif;font-size:18px;font-weight:600;margin-top:5px')}>{doc.name}</div>
          <div style={sx('height:1px;background:#eee;margin:14px 0')} />
          <div style={sx('font-size:12.5px;line-height:1.7;color:#444')}>
            <div style={sx('height:8px;background:#f0f0f0;border-radius:3px;width:100%;margin-bottom:7px')} />
            <div style={sx('height:8px;background:#f0f0f0;border-radius:3px;width:92%;margin-bottom:7px')} />
            <div style={sx('height:8px;background:#f0f0f0;border-radius:3px;width:96%')} />
          </div>
        </div>

        <div style={sx('background:var(--accent-soft);border-radius:11px;padding:14px 16px;margin-bottom:16px')}>
          <div style={sx('font-size:11px;font-weight:700;color:var(--brand);letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px')}>About this document</div>
          <div style={sx('font-size:13px;line-height:1.55;color:var(--ink)')}>{info.desc}</div>
          <div style={sx('font-size:12.5px;line-height:1.5;color:var(--ink);margin-top:10px')}>
            <strong style={{ color: 'var(--brand)' }}>What to do — </strong>
            {info.todo}
          </div>
        </div>

        <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-bottom:10px')}>
          <div style={sx('font-size:13px;font-weight:700;color:var(--ink)')}>Signers · full board required</div>
          <div style={sx('font-size:12px;font-weight:600;color:var(--muted)')}>{signedCount} of {roster.length} signed</div>
        </div>
        {!allSigned && user.isAdmin && (
          <div style={sx('display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px')}>
            {notified && (
              <span style={sx('display:inline-flex;align-items:center;gap:6px;background:var(--good-soft);color:var(--good);font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:7px')}>
                <IconCheckSmall /> Board emailed to sign · {notified.count} sent
              </span>
            )}
            <button
              className="hv-docuseal"
              onClick={() => store.notifyDocSigners(doc.id)}
              style={sx('border:1px solid #1a73e8;background:#eaf1fd;color:#1a73e8;font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:7px;cursor:pointer')}
            >
              {notified ? 'Resend email' : 'Email board to sign'}
            </button>
          </div>
        )}
        <div style={sx('height:6px;background:var(--line);border-radius:20px;overflow:hidden;margin-bottom:14px')}>
          <div style={{ ...sx('height:100%;background:var(--good);border-radius:20px;transition:width .3s'), width: Math.round((signedCount / roster.length) * 100) + '%' }} />
        </div>

        <div style={sx('display:flex;flex-direction:column;gap:8px')}>
          {roster.map((m) => {
            const signed = !!sig[m.id]
            const isYou = m.id === user.member.id
            return (
              <div key={m.id} style={sx('display:flex;align-items:center;gap:12px;background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:10px 13px')}>
                <Avatar initials={m.initials} bg={signed ? 'var(--good)' : 'var(--muted)'} />
                <div style={sx('flex:1;min-width:0')}>
                  <div style={sx('font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
                    {m.name}
                    <YouChip show={isYou} />
                  </div>
                  <div style={sx('font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{m.role}</div>
                </div>
                {signed ? (
                  <span style={sx('display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:var(--good);background:var(--good-soft);padding:4px 10px;border-radius:20px')}>
                    <IconCheckSmall /> Signed
                  </span>
                ) : isYou ? (
                  <button
                    className="hv-bright-sm"
                    onClick={() => store.signMember(m.id)}
                    style={sx('border:none;background:#1a73e8;color:#fff;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;flex:none')}
                  >
                    Sign now
                  </button>
                ) : (
                  <button
                    className="hv-border-accent"
                    onClick={() => store.flash('Reminder sent to ' + m.name)}
                    style={sx('border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:12px;font-weight:600;padding:7px 12px;border-radius:8px;cursor:pointer;flex:none')}
                  >
                    Remind
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={sx('padding:15px 20px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px')}>
        <div style={sx('font-size:12px;color:var(--muted)')}>
          {allSigned
            ? 'Completed · all board members have signed'
            : `${signedCount} of ${roster.length} signatures collected via DocuSeal`}
        </div>
        <div style={sx('display:flex;gap:10px')}>
          <button className="hv-bg" onClick={store.closeModal} style={cancelBtnStyle}>Close</button>
          {!allSigned && user.isAdmin && (
            <>
              <button
                className="hv-border-accent"
                onClick={() => store.notifyDocSigners(doc.id)}
                style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:13px;font-weight:600;padding:9px 14px;border-radius:9px;cursor:pointer')}
              >
                Remind pending
              </button>
              <button
                className="hv-bright"
                onClick={store.signAll}
                style={sx('border:none;background:#1a73e8;color:#fff;font-size:13px;font-weight:600;padding:9px 18px;border-radius:9px;cursor:pointer')}
              >
                Sign all (demo)
              </button>
            </>
          )}
        </div>
      </div>
    </ModalShell>
  )
}

// ------------------------------------------------------------- AI draft
export function AIDraftModal() {
  const store = useStore()
  const dr = store.state.drafting
  if (!dr) return null
  const close = () => store.set({ drafting: null })

  return (
    <ModalShell onClose={close} maxWidth={660}>
      <div style={sx('display:flex;align-items:center;gap:12px;padding:15px 20px;border-bottom:1px solid var(--line)')}>
        <div style={sx('width:32px;height:32px;border-radius:9px;background:var(--accent-soft);color:var(--brand);display:grid;place-items:center;flex:none')}>
          <IconSparkleBrand />
        </div>
        <div style={sx('flex:1;min-width:0')}>
          <div style={sx('font-size:14px;font-weight:700')}>AI document draft</div>
          <div style={sx('font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{dr.motionTitle}</div>
        </div>
        <button className="hv-bg" onClick={close} style={closeBtnStyle}><IconClose /></button>
      </div>

      <div style={sx('padding:16px 20px;overflow:auto;flex:1;background:var(--bg)')}>
        {dr.status === 'loading' ? (
          <div style={sx('display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:50px 20px;text-align:center')}>
            <div style={sx('width:34px;height:34px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:ailspin .8s linear infinite')} />
            <div style={sx('font-size:13.5px;color:var(--muted)')}>Drafting the document from your motion…</div>
          </div>
        ) : (
          <>
            <div style={sx('display:flex;flex-direction:column;gap:7px;margin-bottom:12px')}>
              <label style={sx('font-size:12px;font-weight:600;color:var(--muted)')}>Document title</label>
              <input
                className="inp-plain"
                value={dr.title}
                onChange={(e) => store.set({ drafting: { ...dr, title: e.target.value } })}
                style={sx('width:100%;padding:10px 13px;border:1px solid var(--line);border-radius:9px;background:var(--panel);font-size:14px;font-weight:600;color:var(--ink);outline:none')}
              />
            </div>
            <div style={sx('background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.05)')}>
              <textarea
                value={dr.body}
                onChange={(e) => store.set({ drafting: { ...dr, body: e.target.value } })}
                style={sx("width:100%;min-height:320px;resize:vertical;border:none;background:transparent;outline:none;padding:22px 26px;font-size:13px;line-height:1.7;color:#333;font-family:'Spectral',Georgia,serif")}
              />
            </div>
            <div style={sx('font-size:11.5px;color:var(--muted);margin-top:10px;line-height:1.5')}>
              Review and edit this draft, then have a California nonprofit attorney check it before it's signed. Sending it routes it to DocuSeal for all board members to sign.
            </div>
          </>
        )}
      </div>

      <div style={sx('padding:15px 20px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        {dr.status === 'ready' ? (
          <button
            className="hv-border-accent"
            onClick={() => void store.startDraft(dr.motionId, true)}
            style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12.5px;font-weight:600;padding:9px 14px;border-radius:9px;cursor:pointer')}
          >
            Regenerate
          </button>
        ) : (
          <span />
        )}
        <div style={sx('display:flex;gap:10px')}>
          <button className="hv-bg" onClick={close} style={cancelBtnStyle}>Cancel</button>
          {dr.status === 'ready' && (
            <button
              className="hv-bright"
              onClick={store.sendDraftToDocuSeal}
              style={sx('display:flex;align-items:center;gap:8px;border:none;background:#1a73e8;color:#fff;font-size:13px;font-weight:600;padding:9px 16px;border-radius:9px;cursor:pointer')}
            >
              <span style={sx('width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.22);display:grid;place-items:center;font-size:11px;font-weight:800')}>D</span>
              Send to DocuSeal
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  )
}

// ----------------------------------------------------------- New motion
export function NewMotionModal() {
  const store = useStore()
  const d = store.state.draft
  if (!d) return null
  const close = () => store.set({ draft: null })
  const valid = !!d.title.trim()

  return (
    <ModalShell onClose={close} maxWidth={520}>
      <div style={sx('display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line)')}>
        <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600;flex:1')}>New motion</div>
        <button className="hv-bg" onClick={close} style={closeBtnStyle}><IconClose /></button>
      </div>
      <div style={sx('padding:20px;display:flex;flex-direction:column;gap:16px')}>
        <div style={sx('display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>Motion</label>
          <input
            className="inp"
            value={d.title}
            onChange={(e) => store.set({ draft: { ...d, title: e.target.value } })}
            placeholder={'e.g. Adopt the Bylaws of ' + store.orgName}
            style={fieldInput}
          />
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>Details <span style={sx('color:var(--muted);font-weight:400')}>(optional)</span></label>
          <textarea
            className="inp"
            value={d.desc}
            onChange={(e) => store.set({ draft: { ...d, desc: e.target.value } })}
            placeholder="What exactly is the board deciding? Add any context directors need."
            style={sx('width:100%;min-height:90px;resize:vertical;padding:11px 13px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:14px;line-height:1.5;color:var(--ink);outline:none')}
          />
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>Related meeting <span style={sx('color:var(--muted);font-weight:400')}>(optional)</span></label>
          <select
            className="inp-plain"
            value={d.meeting}
            onChange={(e) => store.set({ draft: { ...d, meeting: e.target.value } })}
            style={fieldInput}
          >
            <option value="">— None —</option>
            {MEETINGS.map((m) => (
              <option key={m.id} value={m.id}>{m.title} · Jul {m.day}</option>
            ))}
          </select>
        </div>
        <div style={sx('display:flex;align-items:flex-start;gap:9px;background:var(--accent-soft);border-radius:10px;padding:11px 13px')}>
          <IconInfo size={15} style={{ flex: 'none', marginTop: 1 }} />
          <div style={sx('font-size:12px;color:var(--brand);line-height:1.5')}>
            Creating this motion schedules a <strong>Zoom vote meeting</strong>, adds it to your <strong>calendar</strong>, and <strong>emails</strong> board members with vote access to review and vote.
          </div>
        </div>
      </div>
      <div style={sx('padding:15px 20px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:10px')}>
        <button className="hv-bg" onClick={close} style={cancelBtnStyle}>Cancel</button>
        <button
          onClick={() => void store.createMotion()}
          style={{
            ...sx('border:none;font-size:13px;font-weight:600;padding:9px 18px;border-radius:9px;color:#fff;background:var(--brand)'),
            cursor: valid ? 'pointer' : 'not-allowed',
            opacity: valid ? 1 : 0.5,
          }}
        >
          Create motion
        </button>
      </div>
    </ModalShell>
  )
}

// -------------------------------------------------------- Manage access
export function ManageAccessModal() {
  const store = useStore()
  const ac = store.state.acct
  if (!ac) return null
  const close = () => store.set({ acct: null })
  const member = store.roster().find((m) => m.id === ac.id)
  const canRevoke = ac.id !== 'alitalia' && (ac.status === 'active' || ac.status === 'invited')

  const permBox = (on: boolean) =>
    sx(
      on
        ? 'width:22px;height:22px;border-radius:7px;border:none;background:var(--accent);display:grid;place-items:center;flex:none;color:#fff'
        : 'width:22px;height:22px;border-radius:7px;border:1.8px solid var(--line);background:var(--panel);flex:none',
    )

  return (
    <ModalShell onClose={close} maxWidth={500}>
      <div style={sx('display:flex;align-items:center;gap:13px;padding:16px 20px;border-bottom:1px solid var(--line)')}>
        <Avatar initials={member?.initials || (ac.name || '?').trim().charAt(0).toUpperCase() || '?'} bg="var(--accent)" size={40} fontSize={14} />
        <div style={sx('flex:1;min-width:0')}>
          <div style={sx('font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{member?.name || ac.name || 'New board member'}</div>
          <div style={sx('font-size:12px;color:var(--muted)')}>{member?.role || (ac.isNew ? 'Director' : '')}</div>
        </div>
        <button className="hv-bg" onClick={close} style={closeBtnStyle}><IconClose /></button>
      </div>
      <div style={sx('padding:20px;display:flex;flex-direction:column;gap:16px;max-height:70vh;overflow:auto')}>
        {ac.isNew && (
          <div style={sx('display:flex;flex-direction:column;gap:7px')}>
            <label style={fieldLabel}>Full name</label>
            <input
              className="inp"
              value={ac.name || ''}
              onChange={(e) => store.set({ acct: { ...ac, name: e.target.value } })}
              placeholder="e.g. Judy Adams"
              style={fieldInput}
            />
          </div>
        )}
        <div style={sx('display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>Username <span style={sx('color:var(--muted);font-weight:400')}>(used to sign in)</span></label>
          <input
            className="inp"
            value={ac.username}
            onChange={(e) => store.set({ acct: { ...ac, username: e.target.value } })}
            placeholder="e.g. judy.adams"
            style={{ ...fieldInput, fontFamily: 'ui-monospace,monospace' }}
          />
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>Personal email <span style={sx('color:var(--muted);font-weight:400')}>(where DocuSeal documents are sent)</span></label>
          <input
            className="inp"
            value={ac.email}
            onChange={(e) => store.set({ acct: { ...ac, email: e.target.value } })}
            placeholder="their personal email address"
            style={fieldInput}
          />
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>Temporary password</label>
          <div style={sx('display:flex;gap:8px')}>
            <input
              className="inp"
              value={ac.pw}
              onChange={(e) => store.set({ acct: { ...ac, pw: e.target.value } })}
              placeholder="Set a password to share"
              style={{ ...sx('flex:1;padding:11px 13px;border:1px solid var(--line);border-radius:10px;background:var(--panel);font-size:14px;color:var(--ink);outline:none'), fontFamily: 'ui-monospace,monospace' }}
            />
            <button
              className="hv-border-accent"
              onClick={store.genPw}
              style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:12.5px;font-weight:600;padding:0 14px;border-radius:10px;cursor:pointer;white-space:nowrap')}
            >
              Generate
            </button>
          </div>
          <div style={sx('font-size:11.5px;color:var(--muted)')}>Share this with the member privately. They'll be asked to change it on first sign-in.</div>
        </div>

        <div style={sx('border-top:1px solid var(--line);padding-top:16px;display:flex;flex-direction:column;gap:12px')}>
          <div style={fieldLabel}>Permissions</div>
          <button
            className="hv-border-accent"
            onClick={() => store.set({ acct: { ...ac, vote: !ac.vote } })}
            style={sx('display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:var(--panel);border-radius:11px;padding:12px 14px;cursor:pointer;text-align:left;width:100%')}
          >
            <span style={permBox(ac.vote)}>{ac.vote && <IconCheck />}</span>
            <span style={{ flex: 1 }}>
              <span style={sx('font-size:13.5px;font-weight:600;display:block')}>Vote on motions</span>
              <span style={sx('font-size:12px;color:var(--muted)')}>Cast For / Against / Abstain on board votes</span>
            </span>
          </button>
          <button
            className="hv-border-accent"
            onClick={() => store.set({ acct: { ...ac, sign: !ac.sign } })}
            style={sx('display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:var(--panel);border-radius:11px;padding:12px 14px;cursor:pointer;text-align:left;width:100%')}
          >
            <span style={permBox(ac.sign)}>{ac.sign && <IconCheck />}</span>
            <span style={{ flex: 1 }}>
              <span style={sx('font-size:13.5px;font-weight:600;display:block')}>Sign documents</span>
              <span style={sx('font-size:12px;color:var(--muted)')}>Sign governance &amp; donor documents in DocuSeal</span>
            </span>
          </button>
        </div>
      </div>
      <div style={sx('padding:15px 20px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        {canRevoke ? (
          <button onClick={store.revokeAcct} style={sx('border:none;background:transparent;color:var(--danger);font-size:12.5px;font-weight:600;padding:9px 4px;border-radius:9px;cursor:pointer')}>
            Revoke access
          </button>
        ) : (
          <span />
        )}
        <div style={sx('display:flex;gap:10px')}>
          <button className="hv-bg" onClick={close} style={cancelBtnStyle}>Cancel</button>
          <button
            className="hv-bright"
            onClick={store.saveAcct}
            style={sx('border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:9px 18px;border-radius:9px;cursor:pointer')}
          >
            {ac.status === 'none' ? 'Send invite' : 'Save changes'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------- Change password
/** Shown when an invited member logs in with the shared temp password. */
export function ChangePasswordModal() {
  const store = useStore()
  if (store.mode !== 'api' || !store.apiMe?.mustChangePassword) return null
  return (
    <ModalShell onClose={() => {}} maxWidth={420}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const input = (e.currentTarget.elements.namedItem('newpw') as HTMLInputElement)
          if (input.value.length < 8) {
            store.flash('Password must be 8+ characters')
            return
          }
          void store.changePassword(input.value)
        }}
      >
        <div style={sx('padding:18px 20px;border-bottom:1px solid var(--line)')}>
          <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600')}>Choose your own password</div>
          <div style={sx('font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.5')}>
            You signed in with a temporary password your admin shared. Set a private one to continue.
          </div>
        </div>
        <div style={sx('padding:20px;display:flex;flex-direction:column;gap:7px')}>
          <label style={fieldLabel}>New password <span style={sx('color:var(--muted);font-weight:400')}>(8+ characters)</span></label>
          <input name="newpw" className="inp" type="password" placeholder="••••••••••" style={fieldInput} autoFocus />
        </div>
        <div style={sx('padding:15px 20px;border-top:1px solid var(--line);display:flex;justify-content:flex-end')}>
          <button
            type="submit"
            className="hv-bright"
            style={sx('border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:9px 18px;border-radius:9px;cursor:pointer')}
          >
            Save password
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ------------------------------------------------------ Upgrade prompt
/** Shown when a free-preview org tries to make a change. */
export function UpgradeModal() {
  const store = useStore()
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  if (!store.state.upgradeOpen) return null
  const close = () => store.set({ upgradeOpen: false })
  const isAdmin = !!store.currentUser?.isAdmin

  return (
    <ModalShell onClose={close} maxWidth={520}>
      <div style={sx('display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line)')}>
        <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600;flex:1')}>Unlock your board portal</div>
        <button className="hv-bg" onClick={close} style={closeBtnStyle}><IconClose /></button>
      </div>
      <div style={sx('padding:20px;display:flex;flex-direction:column;gap:16px')}>
        <div style={sx('font-size:13.5px;color:var(--ink);line-height:1.6')}>
          You're on the <strong>free preview</strong> — you can explore every screen, but checklist steps, documents,
          votes, notes, and board member logins stay locked until your organization picks a plan.
        </div>
        {isAdmin ? (
          <>
            <div style={sx('display:flex;gap:6px;justify-content:center')}>
              {(['monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    ...sx('font-size:11.5px;font-weight:600;padding:5px 13px;border-radius:20px;cursor:pointer'),
                    border: '1px solid ' + (period === p ? 'var(--accent)' : 'var(--line)'),
                    background: period === p ? 'var(--accent-soft)' : 'var(--panel)',
                    color: period === p ? 'var(--brand)' : 'var(--muted)',
                  }}
                >
                  {p === 'monthly' ? 'Monthly' : 'Yearly — 2 months free'}
                </button>
              ))}
            </div>
            <div style={sx('display:flex;flex-direction:column;gap:8px')}>
              {(
                [
                  ['starter', 'Starter', '$49/mo', '$490/yr', 'Up to 7 board members'],
                  ['growth', 'Growth', '$149/mo', '$1,490/yr', 'Unlimited board · most popular'],
                  ['scale', 'Scale', '$299/mo', '$2,990/yr', 'Unlimited board · priority support'],
                ] as const
              ).map(([tier, label, mPrice, yPrice, blurb]) => (
                <button
                  key={tier}
                  className={tier === 'growth' ? 'hv-bright' : 'hv-border-accent'}
                  onClick={() => void store.checkout(tier, period)}
                  style={sx(
                    (tier === 'growth'
                      ? 'border:none;background:var(--brand);color:#fff;'
                      : 'border:1px solid var(--line);background:var(--panel);color:var(--brand);') +
                      'display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13.5px;font-weight:600;padding:12px 16px;border-radius:11px;cursor:pointer;text-align:left',
                  )}
                >
                  <span>
                    {label} · {period === 'monthly' ? mPrice : yPrice}
                    <span style={{ ...sx('display:block;font-size:11.5px;font-weight:500;margin-top:2px'), opacity: 0.75 }}>{blurb}</span>
                  </span>
                  <span aria-hidden>→</span>
                </button>
              ))}
            </div>
            <div style={sx('font-size:11.5px;color:var(--muted);text-align:center;line-height:1.5')}>
              Secure card / bank payment via QuickBooks. Your portal unlocks automatically once payment posts.{' '}
              <a
                href="mailto:support@quorumsuite.com?subject=Quorum%20Launch%20Partner%20%E2%80%94%20request%20a%20quote"
                style={sx('color:var(--accent);font-weight:600;text-decoration:none')}
              >
                Want white-glove setup? Request a Launch Partner quote →
              </a>
            </div>
          </>
        ) : (
          <div style={sx('background:var(--accent-soft);border-radius:11px;padding:13px 16px;font-size:13px;color:var(--brand);line-height:1.55')}>
            Ask your organization's administrator to choose a plan on the <strong>Team &amp; Access</strong> page —
            the whole board unlocks the moment payment posts.
          </div>
        )}
      </div>
      <div style={sx('padding:14px 20px;border-top:1px solid var(--line);display:flex;justify-content:flex-end')}>
        <button className="hv-bg" onClick={close} style={cancelBtnStyle}>Keep looking around</button>
      </div>
    </ModalShell>
  )
}

// ------------------------------------------------------- Email preview
export function EmailPreviewModal() {
  const store = useStore()
  const { state } = store
  const motion = state.emailPreview ? state.motions.find((m) => m.id === state.emailPreview) : undefined
  if (!motion) return null
  const close = () => store.set({ emailPreview: null })
  const recips = store.notifiableVoters()
  const fromName = store.currentUser?.member.name || 'Your administrator'
  const fromEmail =
    state.emailAddress || 'board@' + store.orgName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.org'

  return (
    <ModalShell onClose={close} maxWidth={560} scrollBody>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--line)')}>
        <div style={sx('display:flex;align-items:center;gap:11px')}>
          <div style={sx('width:34px;height:34px;border-radius:9px;background:var(--accent-soft);display:grid;place-items:center;flex:none')}>
            <IconMailBrand />
          </div>
          <div>
            <div style={sx('font-size:14px;font-weight:700')}>Email to the board</div>
            <div style={sx('font-size:12px;color:var(--muted)')}>This is exactly what each voting member receives</div>
          </div>
        </div>
        <button onClick={close} style={sx('border:none;background:transparent;cursor:pointer;color:var(--muted);font-size:20px;line-height:1;padding:4px')}>×</button>
      </div>
      <div style={sx('padding:18px 20px')}>
        <div style={sx('border:1px solid var(--line);border-radius:12px;overflow:hidden')}>
          <div style={sx('padding:13px 16px;border-bottom:1px solid var(--line);background:var(--bg)')}>
            <div style={sx('display:flex;gap:8px;font-size:12px;margin-bottom:4px')}>
              <span style={sx('color:var(--muted);width:52px;flex:none')}>From</span>
              <span style={sx('color:var(--ink)')}>{fromName} · {store.orgName} &lt;{fromEmail}&gt;</span>
            </div>
            <div style={sx('display:flex;gap:8px;font-size:12px;margin-bottom:4px')}>
              <span style={sx('color:var(--muted);width:52px;flex:none')}>To</span>
              <span style={sx('color:var(--ink)')}>
                {recips.length ? recips.map((m) => m.name.split(' ')[0]).join(', ') + ' + you' : 'Board members with vote access'}
              </span>
            </div>
            <div style={sx('display:flex;gap:8px;font-size:12px')}>
              <span style={sx('color:var(--muted);width:52px;flex:none')}>Subject</span>
              <span style={sx('color:var(--ink);font-weight:600')}>Board vote requested: {motion.title}</span>
            </div>
          </div>
          <div style={sx('padding:20px 18px')}>
            <div style={sx('font-family:Spectral,serif;font-size:18px;font-weight:600;color:var(--ink);margin-bottom:4px')}>{store.orgName}</div>
            <div style={sx('font-size:13.5px;color:var(--ink);line-height:1.6;margin-bottom:16px')}>
              Hello, the board is asked to vote on the motion below. Please review the details and cast your vote in the portal.
            </div>

            <div style={sx('font-size:10.5px;font-weight:700;color:var(--brand);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px')}>You are voting on</div>
            <div style={sx('font-family:Spectral,serif;font-size:16px;font-weight:600;color:var(--ink);line-height:1.35;margin-bottom:6px')}>{motion.title}</div>
            <div style={sx('font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:18px')}>{motion.desc || 'No additional details provided.'}</div>

            <div style={sx('display:flex;flex-direction:column;gap:10px;background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:14px 16px;margin-bottom:18px')}>
              <div style={sx('display:flex;align-items:center;gap:10px')}>
                <IconCalendarSm />
                <div style={sx('font-size:13px;color:var(--ink)')}>
                  <strong>Discussion meeting:</strong>{' '}
                  {motion.voteDay ? `July ${motion.voteDay}, 2026 · ${motion.voteTime || '4:00 PM'} PT` : 'To be scheduled'}
                </div>
              </div>
              {motion.zoomUrl && (
                <div style={sx('display:flex;align-items:center;gap:10px')}>
                  <IconZoom size={16} fill="#2160c4" />
                  <a href={motion.zoomUrl} target="_blank" rel="noreferrer" style={sx('font-size:13px;color:#2160c4;font-weight:600;text-decoration:none')}>
                    Join the Zoom discussion
                  </a>
                </div>
              )}
            </div>

            <a
              href="#"
              onClick={(e) => { e.preventDefault(); close() }}
              style={sx('display:block;text-align:center;background:var(--accent);color:#fff;font-size:14px;font-weight:600;padding:12px;border-radius:10px;text-decoration:none;margin-bottom:10px')}
            >
              Review &amp; vote in the portal →
            </a>
            <div style={sx('font-size:11.5px;color:var(--muted);text-align:center;line-height:1.5')}>
              The official vote is cast in the portal. The Zoom meeting is for discussion only.
            </div>
          </div>
        </div>
      </div>
      <div style={sx('padding:14px 20px;border-top:1px solid var(--line);display:flex;justify-content:flex-end')}>
        <button className="hv-bg" onClick={close} style={sx('border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:13px;font-weight:600;padding:9px 18px;border-radius:9px;cursor:pointer')}>
          Close
        </button>
      </div>
    </ModalShell>
  )
}
