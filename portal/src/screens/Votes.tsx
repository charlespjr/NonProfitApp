import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { MEETINGS } from '../data/seed'
import {
  IconEye,
  IconMail,
  IconPlus,
  IconSparkle,
  IconTrash,
  IconVotes,
  IconZoom,
} from '../components/icons'
import { Avatar, YouChip } from '../components/shared'
import type { Motion, VoteChoice } from '../types'

const VC: Record<VoteChoice, string> = {
  for: 'var(--good)',
  against: 'var(--danger)',
  abstain: 'var(--muted)',
}

function MotionCard({ mo }: { mo: Motion }) {
  const store = useStore()
  const user = store.currentUser!
  const roster = store.roster()
  const votes = mo.votes

  const forN = roster.filter((m) => votes[m.id] === 'for').length
  const againstN = roster.filter((m) => votes[m.id] === 'against').length
  const abstainN = roster.filter((m) => votes[m.id] === 'abstain').length
  const total = roster.length
  const castN = forN + againstN + abstainN
  const majority = Math.floor(total / 2) + 1

  let rLabel: string, rBg: string, rFg: string
  if (forN >= majority) { rLabel = 'Passed'; rBg = 'var(--good-soft)'; rFg = 'var(--good)' }
  else if (againstN >= majority || (castN === total && forN < majority)) { rLabel = 'Failed'; rBg = 'var(--warn-soft)'; rFg = 'var(--danger)' }
  else { rLabel = 'Open · voting'; rBg = 'var(--bg)'; rFg = 'var(--muted)' }

  const meetingTitle = mo.meeting ? MEETINGS.find((m) => m.id === mo.meeting) : undefined
  const bar = (n: number, c: string) => ({
    width: (n / total) * 100 + '%',
    background: c,
    transition: 'width .3s',
    ...(n === 0 ? { display: 'none' } : {}),
  })

  const docHint = mo.docId
    ? 'Document drafted and sent to DocuSeal for signing.'
    : rLabel === 'Passed'
      ? 'Motion passed — draft the document for signing.'
      : 'Have AI draft the related document for signing.'

  return (
    <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:15px;overflow:hidden')}>
      <div style={sx('padding:18px 20px;border-bottom:1px solid var(--line)')}>
        <div style={sx('display:flex;align-items:flex-start;justify-content:space-between;gap:14px')}>
          <div style={sx('min-width:0')}>
            <div style={sx('font-family:Spectral,serif;font-size:17px;font-weight:600;line-height:1.3')}>{mo.title}</div>
            <div style={sx('font-size:13px;color:var(--muted);margin-top:5px;line-height:1.5')}>{mo.desc || 'No additional details.'}</div>
            <div style={sx('font-size:11.5px;color:var(--muted);margin-top:8px')}>
              Created {mo.created}
              {meetingTitle ? ` · ${meetingTitle.title} · Jul ${meetingTitle.day}` : ''}
            </div>
            <div style={sx('display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center')}>
              {mo.zoomUrl && (
                <a
                  className="hv-dim"
                  href={mo.zoomUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={sx('display:inline-flex;align-items:center;gap:6px;text-decoration:none;background:#e7f1ff;color:#2160c4;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:7px')}
                >
                  <IconZoom /> Join vote meeting
                </a>
              )}
              {mo.notifiedAt && (
                <span style={sx('display:inline-flex;align-items:center;gap:6px;background:var(--good-soft);color:var(--good);font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:7px')}>
                  <IconMail /> Board emailed · {mo.notifiedCount || 0} sent
                </span>
              )}
              {user.isAdmin && (
                <>
                  <button
                    className="hv-border-accent"
                    onClick={() => store.notifyBoard(mo.id)}
                    style={sx('border:1px solid var(--line);background:var(--panel);color:var(--brand);font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:7px;cursor:pointer')}
                  >
                    {mo.notifiedAt ? 'Resend email' : 'Email board to vote'}
                  </button>
                  <button
                    className="hv-border-accent-brand"
                    onClick={() => store.set({ emailPreview: mo.id })}
                    style={sx('display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:7px;cursor:pointer')}
                  >
                    <IconEye /> Preview email
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={sx('display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex:none')}>
            <span style={{ ...sx('font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px'), background: rBg, color: rFg }}>{rLabel}</span>
            {user.isAdmin && (
              <button
                className="hv-warn-danger"
                onClick={() => store.removeMotion(mo.id)}
                title="Delete motion"
                style={sx('border:none;background:transparent;color:var(--muted);cursor:pointer;padding:5px;border-radius:7px;display:flex')}
              >
                <IconTrash size={15} />
              </button>
            )}
          </div>
        </div>

        <div style={sx('display:flex;gap:6px;margin-top:14px;height:9px;border-radius:20px;overflow:hidden;background:var(--bg)')}>
          <div style={bar(forN, VC.for)} />
          <div style={bar(againstN, VC.against)} />
          <div style={bar(abstainN, VC.abstain)} />
        </div>
        <div style={sx('display:flex;gap:16px;margin-top:9px;font-size:12px;color:var(--muted);flex-wrap:wrap')}>
          <span style={sx('display:flex;align-items:center;gap:6px')}><span style={sx('width:9px;height:9px;border-radius:50%;background:var(--good)')} />For {forN}</span>
          <span style={sx('display:flex;align-items:center;gap:6px')}><span style={sx('width:9px;height:9px;border-radius:50%;background:var(--danger)')} />Against {againstN}</span>
          <span style={sx('display:flex;align-items:center;gap:6px')}><span style={sx('width:9px;height:9px;border-radius:50%;background:var(--muted)')} />Abstain {abstainN}</span>
          <span style={{ marginLeft: 'auto' }}>{castN} of {total} directors voted</span>
        </div>
      </div>

      <div style={sx('padding:8px 10px')}>
        {roster.map((m) => {
          const v = votes[m.id]
          const isYou = m.id === user.member.id
          const canVote = isYou && user.account.vote
          const voteBtn = (kind: VoteChoice, label: string) => {
            const on = v === kind
            const col = VC[kind]
            return (
              <button
                key={kind}
                onClick={() => store.castVote(mo.id, m.id, kind)}
                style={{
                  ...sx('font-size:12px;font-weight:600;padding:6px 11px;border-radius:8px;cursor:pointer'),
                  border: '1px solid ' + (on ? col : 'var(--line)'),
                  background: on ? col : 'var(--panel)',
                  color: on ? '#fff' : 'var(--muted)',
                }}
              >
                {label}
              </button>
            )
          }
          return (
            <div key={m.id} className="hv-row" style={sx('display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:10px')}>
              <Avatar initials={m.initials} bg={v ? VC[v] : 'var(--muted)'} />
              <div style={sx('flex:1;min-width:0')}>
                <div style={sx('font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
                  {m.name}
                  <YouChip show={isYou} />
                </div>
                <div style={sx('font-size:11.5px;color:var(--muted)')}>{m.role}</div>
              </div>
              {canVote ? (
                <div style={sx('display:flex;gap:6px;flex:none')}>
                  {voteBtn('for', 'For')}
                  {voteBtn('against', 'Against')}
                  {voteBtn('abstain', 'Abstain')}
                </div>
              ) : !v ? (
                <button
                  className="hv-border-accent"
                  onClick={() => store.flash('Reminder sent to ' + m.name)}
                  style={sx('border:1px solid var(--line);background:var(--panel);color:var(--muted);font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;cursor:pointer;flex:none')}
                >
                  Remind
                </button>
              ) : (
                <span style={{ ...sx('font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:20px;color:#fff;flex:none'), background: VC[v] }}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {user.isAdmin && (
        <div style={sx('padding:12px 16px;border-top:1px solid var(--line);display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--bg)')}>
          <IconSparkle style={{ flex: 'none' }} />
          <div style={sx('flex:1;min-width:0;font-size:12.5px;color:var(--muted)')}>{docHint}</div>
          <button
            className="hv-bright-sm"
            onClick={() => (mo.docId ? store.openModal(mo.docId) : void store.startDraft(mo.id))}
            style={{
              ...sx('display:flex;align-items:center;gap:7px;border:none;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;flex:none;color:#fff'),
              background: mo.docId ? 'var(--brand)' : 'var(--accent)',
            }}
          >
            {mo.docId ? 'View document' : 'Draft document with AI'}
          </button>
        </div>
      )}
    </div>
  )
}

export function Votes() {
  const store = useStore()
  const { state, currentUser } = store
  const user = currentUser!

  return (
    <div style={sx('max-width:900px;margin:0 auto')}>
      <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px')}>
        <div>
          <div style={sx('font-family:Spectral,serif;font-size:22px;font-weight:600')}>Board votes &amp; motions</div>
          <div style={sx("font-size:13.5px;color:var(--muted);margin-top:3px")}>Put a decision to the board, collect each director's vote, and record the result.</div>
        </div>
        {user.isAdmin && (
          <button
            className="hv-bright"
            onClick={store.openNewMotion}
            style={sx('display:flex;align-items:center;gap:8px;border:none;background:var(--brand);color:#fff;font-size:13.5px;font-weight:600;padding:11px 16px;border-radius:10px;cursor:pointer')}
          >
            <IconPlus /> New motion
          </button>
        )}
      </div>

      {state.motions.length === 0 && (
        <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:52px 30px;text-align:center;max-width:460px;margin:30px auto')}>
          <div style={sx('width:56px;height:56px;border-radius:14px;background:var(--bg);border:1px solid var(--line);display:grid;place-items:center;margin:0 auto 16px')}>
            <IconVotes size={26} stroke="var(--accent)" />
          </div>
          <div style={sx('font-family:Spectral,serif;font-size:19px;font-weight:600')}>No motions yet</div>
          <div style={sx('font-size:13.5px;color:var(--muted);margin-top:8px;line-height:1.55')}>
            When the board needs to decide something — adopting the bylaws, approving the budget, authorizing the bank account — create a motion here and each director casts their vote.
          </div>
        </div>
      )}

      <div style={sx('display:flex;flex-direction:column;gap:16px')}>
        {state.motions.map((mo) => (
          <MotionCard key={mo.id} mo={mo} />
        ))}
      </div>
    </div>
  )
}
