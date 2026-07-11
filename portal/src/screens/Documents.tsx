import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { DOC_INFO } from '../data/seed'
import { IconDocuments, IconInfo, IconPlus } from '../components/icons'
import { STATUS_META } from '../components/shared'
import type { DocCategory } from '../types'

const CATS: Array<'All' | DocCategory> = ['All', 'Governance', 'Fundraising', 'Donor Letters']

export function Documents() {
  const store = useStore()
  const { state } = store
  const docs = store.allDocs()
  const rosterN = store.roster().length

  const q = state.search.trim().toLowerCase()
  let filtered = docs.filter((d) => state.docCat === 'All' || d.cat === state.docCat)
  if (q) filtered = filtered.filter((d) => d.name.toLowerCase().includes(q))

  return (
    <div style={sx('max-width:1080px;margin:0 auto')}>
      <div style={sx('display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px')}>
        {CATS.map((c) => {
          const active = state.docCat === c
          return (
            <button
              key={c}
              className="hv-border-accent"
              onClick={() => store.set({ docCat: c })}
              style={{
                ...sx('font-size:13px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer'),
                border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
                background: active ? 'var(--accent-soft)' : 'var(--panel)',
                color: active ? 'var(--brand)' : 'var(--ink)',
              }}
            >
              {c}
              <span style={sx('opacity:.6;margin-left:6px')}>
                {c === 'All' ? docs.length : docs.filter((d) => d.cat === c).length}
              </span>
            </button>
          )
        })}
        {store.currentUser?.isAdmin && (
          <button
            className="hv-bright"
            onClick={store.openAddDoc}
            style={sx('display:flex;align-items:center;gap:7px;margin-left:auto;border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer')}
          >
            <IconPlus /> Add document
          </button>
        )}
      </div>

      <div style={sx('background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden')}>
        <div data-m="dochead" style={sx('display:grid;grid-template-columns:minmax(0,1fr) 130px 170px 150px;gap:12px;padding:13px 20px;border-bottom:1px solid var(--line);font-size:11.5px;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;font-weight:600')}>
          <div>Document</div><div>Category</div><div>Status</div><div style={{ textAlign: 'right' }}>Action</div>
        </div>
        {filtered.map((d) => {
          const st = store.docStatusOf(d)
          const isSigned = st === 'signed'
          const nSig = store.signedCountFor(d.id)
          const rawInfo = DOC_INFO[d.id] || { desc: d.desc || '', todo: d.todo || '' }
          const info = { desc: store.brand(rawInfo.desc), todo: store.brand(rawInfo.todo) }
          const signText = isSigned
            ? `Signed by all ${rosterN} board members`
            : st === 'draft'
              ? `Updated ${d.updated}`
              : `${nSig} of ${rosterN} board members signed`
          return (
            <div key={d.id} data-m="docrow" className="hv-row" style={sx('display:grid;grid-template-columns:minmax(0,1fr) 130px 170px 150px;gap:12px;padding:15px 20px;border-bottom:1px solid var(--line);align-items:center')}>
              <div style={sx('display:flex;align-items:center;gap:13px;min-width:0')}>
                <span style={sx('width:38px;height:38px;border-radius:9px;background:var(--accent-soft);color:var(--brand);display:grid;place-items:center;flex:none')}>
                  <IconDocuments size={18} strokeWidth={1.6} />
                </span>
                <div style={sx('min-width:0')}>
                  <div style={sx('font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{d.name}</div>
                  <div style={sx('font-size:12px;color:var(--muted);line-height:1.4;margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical')}>{info.desc}</div>
                  <div style={sx('font-size:11px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{d.pages} pp · {signText}</div>
                </div>
              </div>
              <div style={sx('font-size:13px;color:var(--muted)')}>{d.cat}</div>
              <div><span style={STATUS_META[st].style}>{STATUS_META[st].label}</span></div>
              <div style={sx('display:flex;align-items:center;justify-content:flex-end;gap:6px')}>
                <button
                  className="hv-bright-sm"
                  onClick={() => store.openModal(d.id)}
                  style={sx(
                    isSigned
                      ? 'border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer'
                      : 'border:none;background:var(--brand);color:#fff;font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer',
                  )}
                >
                  {isSigned ? 'View' : 'Open in DocuSeal'}
                </button>
                {store.currentUser?.isAdmin && state.customDocs.some((c) => c.id === d.id) && (
                  <button
                    className="hv-danger"
                    title="Remove this document"
                    aria-label={'Remove document: ' + d.name}
                    onClick={() => store.removeCustomDoc(d.id)}
                    style={sx('border:none;background:transparent;color:var(--muted);font-size:15px;line-height:1;cursor:pointer;padding:6px')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div style={sx('display:flex;align-items:center;gap:8px;margin-top:14px;font-size:12px;color:var(--muted)')}>
        <IconInfo size={14} stroke="currentColor" />
        Blue fields in each document are DocuSeal electronic-signature fields. Signing here updates the document's status.
      </div>
    </div>
  )
}
