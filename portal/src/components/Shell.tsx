import type { ReactNode } from 'react'
import { sx } from '../lib/sx'
import { useStore } from '../state/store'
import { PHASES } from '../data/seed'
import {
  IconCalendar,
  IconChecklist,
  IconDashboard,
  IconDocuments,
  IconHamburger,
  IconLogout,
  IconNotes,
  IconPlus,
  IconSearch,
  IconTeam,
  IconVotes,
} from './icons'
import type { ScreenKey } from '../types'
import { Avatar } from './shared'
import { InstallApp } from './InstallApp'

const PAGE_TITLE: Record<ScreenKey, string> = {
  dashboard: 'Dashboard',
  documents: 'Documents',
  checklist: 'Launch Checklist',
  calendar: 'Calendar',
  notes: 'Notes',
  votes: 'Board Votes',
  team: 'Team & Access',
}

const PAGE_SUB: Record<ScreenKey, string> = {
  dashboard: 'Adams Infinite Legacy · Founder workspace',
  documents: 'Governance, fundraising & donor letters',
  checklist: 'Steps to launch the foundation',
  calendar: 'Board meetings & planning sessions',
  notes: 'Private to your account',
  votes: 'Motions & board decisions',
  team: 'Board member logins & permissions',
}

export function Shell({ children }: { children: ReactNode }) {
  const store = useStore()
  const { state, currentUser } = store
  const user = currentUser!

  // nav badges
  const docs = store.allDocs()
  const pendingSign = docs.filter((d) => store.docStatusOf(d) === 'sent').length
  let total = 0
  let done = 0
  PHASES.forEach((p) => p.items.forEach((t) => { total++; if (state.tasks[t.id]) done++ }))
  const openTasks = total - done
  const openVotes = state.motions.filter((m) => !m.votes[user.member.id]).length

  const nav: Array<{ key: ScreenKey; label: string; icon: ReactNode; badge?: number; adminOnly?: boolean }> = [
    { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { key: 'documents', label: 'Documents', icon: <IconDocuments />, badge: pendingSign },
    { key: 'checklist', label: 'Launch Checklist', icon: <IconChecklist />, badge: openTasks },
    { key: 'votes', label: 'Board Votes', icon: <IconVotes />, badge: openVotes },
    { key: 'calendar', label: 'Calendar', icon: <IconCalendar /> },
    { key: 'notes', label: 'Notes', icon: <IconNotes /> },
    // Team & Access is an admin/IT function — hidden from board members.
    { key: 'team', label: 'Team & Access', icon: <IconTeam />, adminOnly: true },
  ]

  return (
    <div data-nav={state.navOpen ? 'open' : 'closed'} style={sx('display:flex;min-height:100vh')}>
      <div data-m="backdrop" onClick={() => store.set({ navOpen: false })} />

      <aside data-m="sidebar" style={sx('width:252px;flex:none;background:var(--panel);border-right:1px solid var(--line);display:flex;flex-direction:column;padding:20px 15px;position:sticky;top:0;height:100vh')}>
        <div style={sx('display:flex;align-items:center;gap:11px;padding:6px 8px 20px')}>
          <div style={sx('width:36px;height:36px;border-radius:10px;background:var(--brand);color:#fff;display:grid;place-items:center;font-family:Spectral,serif;font-size:18px;font-weight:600')}>
            {(store.apiOrg?.name || 'Adams Infinite')[0]}
          </div>
          <div style={{ lineHeight: 1.15, minWidth: 0 }}>
            <div style={sx('font-family:Spectral,serif;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
              {store.apiOrg?.name || 'Adams Infinite'}
            </div>
            <div style={sx('font-size:10.5px;color:var(--muted);letter-spacing:.13em')}>{store.apiOrg ? 'BOARD PORTAL' : 'LEGACY PORTAL'}</div>
          </div>
        </div>

        <div style={sx('font-size:10.5px;letter-spacing:.12em;color:var(--muted);padding:8px 10px 6px')}>WORKSPACE</div>
        {nav
          .filter((item) => !item.adminOnly || user.isAdmin)
          .map((item) => {
            const active = state.screen === item.key
            return (
              <button
                key={item.key}
                className={active ? undefined : 'hv-soft'}
                onClick={() => store.go(item.key)}
                style={{
                  ...sx('display:flex;align-items:center;gap:12px;width:100%;border:none;cursor:pointer;padding:10px 12px;border-radius:9px;font-size:13.5px;transition:background .15s'),
                  fontWeight: active ? 600 : 500,
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--ink)',
                }}
              >
                <span style={sx('display:flex;width:18px;height:18px;flex:none')}>{item.icon}</span>
                <span style={sx('flex:1;text-align:left')}>{item.label}</span>
                {!!item.badge && (
                  <span
                    style={{
                      ...sx('font-size:11px;font-weight:700;min-width:19px;height:19px;padding:0 5px;border-radius:20px;display:grid;place-items:center;color:#fff'),
                      background: active ? 'var(--brand)' : 'var(--accent)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}

        <div style={sx('margin-top:auto;border-top:1px solid var(--line);padding-top:12px')}>
          <InstallApp variant="sidebar" />
          <div style={sx('display:flex;align-items:center;gap:11px;padding:8px 8px')}>
            <Avatar initials={user.member.initials} bg="var(--accent)" size={36} fontSize={13} />
            <div style={sx('min-width:0;flex:1')}>
              <div style={sx('font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{user.member.name}</div>
              <div style={sx('font-size:11px;color:var(--muted)')}>{user.member.role}</div>
            </div>
            <button
              className="hv-soft-ink"
              onClick={store.logout}
              title="Sign out"
              style={sx('border:none;background:transparent;color:var(--muted);cursor:pointer;padding:6px;border-radius:7px;display:flex')}
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      <div style={sx('flex:1;display:flex;flex-direction:column;min-width:0')}>
        <header data-m="header" style={sx('display:flex;align-items:center;gap:16px;padding:16px 30px;border-bottom:1px solid var(--line);background:color-mix(in srgb, var(--panel) 72%, transparent);backdrop-filter:blur(8px);position:sticky;top:0;z-index:20')}>
          <button
            data-m="hamburger"
            className="hv-bg"
            onClick={() => store.set({ navOpen: true })}
            title="Menu"
            style={sx('display:none;align-items:center;justify-content:center;border:1px solid var(--line);background:var(--panel);color:var(--ink);width:38px;height:38px;border-radius:9px;cursor:pointer;flex:none;padding:0')}
          >
            <IconHamburger />
          </button>
          <div data-m="htext" style={sx('flex:1;min-width:0')}>
            <div data-mt="title" style={sx('font-family:Spectral,serif;font-size:20px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{PAGE_TITLE[state.screen]}</div>
            <div style={sx('font-size:12.5px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
              {state.screen === 'dashboard' && store.apiOrg ? `${store.apiOrg.name} · Founder workspace` : PAGE_SUB[state.screen]}
            </div>
          </div>
          <div style={sx('display:flex;align-items:center;gap:12px;flex:none')}>
            <div data-m="search" style={sx('display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:9px;padding:8px 12px;width:220px')}>
              <IconSearch />
              <input
                value={state.search}
                onChange={(e) => store.set({ search: e.target.value })}
                placeholder="Search documents…"
                style={sx('border:none;background:transparent;outline:none;font-size:13px;color:var(--ink);width:100%')}
              />
            </div>
            <button
              data-m="newnote"
              className="hv-bright"
              onClick={store.newNote}
              style={sx('display:flex;align-items:center;gap:7px;border:none;background:var(--brand);color:#fff;font-size:13px;font-weight:600;padding:9px 14px;border-radius:9px;cursor:pointer')}
            >
              <IconPlus />
              <span data-mt="lbl">New note</span>
            </button>
          </div>
        </header>

        {store.locked && (
          <div data-m="lockbar" style={sx('display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 30px;background:var(--warn-soft);border-bottom:1px solid var(--line)')}>
            <div style={sx('flex:1;min-width:220px;font-size:12.5px;color:var(--ink);line-height:1.5')}>
              <strong>Free preview</strong> — look around all you like; checklist, documents, votes, notes, and member
              logins unlock when your organization {user.isAdmin ? 'picks a plan' : "picks a plan (ask your admin)"}.
            </div>
            {user.isAdmin && (
              <button
                className="hv-bright"
                onClick={() => store.set({ upgradeOpen: true })}
                style={sx('border:none;background:var(--brand);color:#fff;font-size:12.5px;font-weight:600;padding:8px 15px;border-radius:9px;cursor:pointer;flex:none')}
              >
                Choose a plan
              </button>
            )}
          </div>
        )}
        <main data-m="main" style={sx('flex:1;padding:28px 30px 60px;overflow:auto')}>{children}</main>
      </div>
    </div>
  )
}
