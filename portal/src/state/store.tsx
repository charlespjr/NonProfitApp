/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BASE_DOCS, MEETINGS, MEMBERS, SEED_ACCOUNTS } from '../data/seed'
import {
  mockAuth,
  mockCalendar,
  mockDraft,
  mockMail,
  mockSignatures,
  mockZoom,
} from '../services'
import type {
  Account,
  AppState,
  CurrentUser,
  DashboardLayout,
  DocStatus,
  Meeting,
  Member,
  Motion,
  PersistedState,
  PortalDoc,
  ScreenKey,
  ThemeName,
  VoteChoice,
} from '../types'

const STORAGE_KEY = 'ail_portal_prod_v1'

const services = {
  auth: mockAuth,
  signatures: mockSignatures,
  calendar: mockCalendar,
  zoom: mockZoom,
  mail: mockMail,
  draft: mockDraft,
}

function fmtDate(d = new Date()): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const defaultPersisted: PersistedState = {
  sessionUserId: null,
  screen: 'dashboard',
  sig: {},
  docNotified: {},
  tasks: {},
  notes: [],
  activeNoteId: null,
  calConnected: false,
  emailConnected: false,
  zoomConnected: false,
  motions: [],
  accounts: SEED_ACCOUNTS,
  extraMembers: [],
  customDocs: [],
  theme: 'warm',
  dashboardLayout: 'Overview grid',
}

const defaultUi = {
  search: '',
  docCat: 'All' as const,
  modal: null,
  toast: '',
  draft: null,
  drafting: null,
  emailPreview: null,
  acct: null,
  navOpen: false,
  noteSaved: 'Saved' as const,
  loginError: '',
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPersisted
    const s = JSON.parse(raw) as Partial<PersistedState>
    return {
      ...defaultPersisted,
      ...s,
      accounts: s.accounts && typeof s.accounts === 'object' ? (s.accounts as Record<string, Account>) : SEED_ACCOUNTS,
      notes: Array.isArray(s.notes) ? s.notes : [],
      motions: Array.isArray(s.motions) ? s.motions : [],
      extraMembers: Array.isArray(s.extraMembers) ? s.extraMembers : [],
      customDocs: Array.isArray(s.customDocs) ? s.customDocs : [],
    }
  } catch {
    return defaultPersisted
  }
}

export interface Store {
  state: AppState
  currentUser: CurrentUser | null

  // derived domain helpers
  roster(): Member[]
  allMeetings(): Meeting[]
  meetingsView(): Meeting[]
  allDocs(): PortalDoc[]
  sigFor(docId: string): Record<string, boolean>
  signedCountFor(docId: string): number
  docStatusOf(doc: PortalDoc): DocStatus

  // generic setters
  set(patch: Partial<AppState>): void
  flash(msg: string): void
  setTheme(theme: ThemeName): void
  setDashboardLayout(layout: DashboardLayout): void

  // auth
  login(identifier: string, password: string, remember: boolean): Promise<void>
  logout(): void

  // navigation
  go(screen: ScreenKey): void

  // checklist
  toggleTask(id: string): void

  // documents / signatures
  openModal(docId: string): void
  closeModal(): void
  signMember(memberId: string): void
  signAll(): void
  notifyDocSigners(docId: string): void

  // notes
  newNote(): void
  updateNote(field: 'title' | 'body', value: string): void
  deleteNote(): void

  // motions
  castVote(motionId: string, memberId: string, choice: VoteChoice): void
  createMotion(): Promise<void>
  removeMotion(id: string): void
  notifyBoard(motionId: string): void
  notifiableVoters(): Member[]

  // AI drafting
  startDraft(motionId: string, regen?: boolean): Promise<void>
  sendDraftToDocuSeal(): void

  // team & access
  manageMember(id: string): void
  addMember(): void
  genPw(): void
  saveAcct(): void
  revokeAcct(): void

  // integrations
  connectCal(): void
  disconnectCal(): void
  connectZoom(): void
  disconnectZoom(): void
  connectEmail(): void
  disconnectEmail(): void
}

const StoreCtx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({ ...loadPersisted(), ...defaultUi }))
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()
  const noteTimer = useRef<ReturnType<typeof setTimeout>>()

  // Persist the durable slice whenever it changes.
  useEffect(() => {
    const p: PersistedState = {
      sessionUserId: state.sessionUserId,
      screen: state.screen,
      sig: state.sig,
      docNotified: state.docNotified,
      tasks: state.tasks,
      notes: state.notes,
      activeNoteId: state.activeNoteId,
      calConnected: state.calConnected,
      emailConnected: state.emailConnected,
      zoomConnected: state.zoomConnected,
      motions: state.motions,
      accounts: state.accounts,
      extraMembers: state.extraMembers,
      customDocs: state.customDocs,
      theme: state.theme,
      dashboardLayout: state.dashboardLayout,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    } catch {
      /* storage full/unavailable — state remains in memory */
    }
  }, [state])

  const set = useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }))
  }, [])

  const flash = useCallback((msg: string) => {
    setState((s) => ({ ...s, toast: msg }))
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: '' })), 2200)
  }, [])

  const roster = useCallback(
    () => MEMBERS.concat(state.extraMembers),
    [state.extraMembers],
  )

  const currentUser: CurrentUser | null = useMemo(() => {
    if (!state.sessionUserId) return null
    const member = roster().find((m) => m.id === state.sessionUserId)
    const account = state.accounts[state.sessionUserId]
    if (!member || !account) return null
    return { member, account, isAdmin: !!account.admin }
  }, [state.sessionUserId, state.accounts, roster])

  const allMeetings = useCallback((): Meeting[] => {
    const motionMeetings: Meeting[] = state.motions
      .filter((mo) => mo.voteDay && !mo.meeting)
      .map((mo) => ({
        id: 'vote-' + mo.id,
        day: mo.voteDay!,
        time: mo.voteTime || '4:00 PM',
        title: 'Board vote: ' + mo.title,
        who: 'Board — review & vote',
        zoom: !!mo.zoomUrl,
        zoomUrl: mo.zoomUrl,
        isVote: true,
      }))
    return MEETINGS.concat(motionMeetings).sort((a, b) => a.day - b.day)
  }, [state.motions])

  const meetingsView = useCallback(
    (): Meeting[] =>
      allMeetings().map((m) => ({
        ...m,
        zoomUrl: m.zoomUrl || 'https://zoom.us/j/' + (8300000000 + m.day * 111111),
      })),
    [allMeetings],
  )

  const allDocs = useCallback(
    (): PortalDoc[] => BASE_DOCS.concat(state.customDocs),
    [state.customDocs],
  )

  const sigFor = useCallback(
    (docId: string): Record<string, boolean> => ({ ...(state.sig[docId] || {}) }),
    [state.sig],
  )

  const signedCountFor = useCallback(
    (docId: string) => {
      const s = sigFor(docId)
      return roster().filter((m) => s[m.id]).length
    },
    [sigFor, roster],
  )

  const docStatusOf = useCallback(
    (doc: PortalDoc): DocStatus => {
      const n = signedCountFor(doc.id)
      if (n >= roster().length) return 'signed'
      if (n > 0 || state.docNotified[doc.id] || state.customDocs.some((d) => d.id === doc.id)) return 'sent'
      return 'draft'
    },
    [signedCountFor, roster, state.docNotified, state.customDocs],
  )

  const notifiableVoters = useCallback(
    () =>
      roster().filter((m) => {
        const a = state.accounts[m.id]
        return !!a && a.vote && !!a.email && m.id !== state.sessionUserId
      }),
    [roster, state.accounts, state.sessionUserId],
  )

  // ------------------------------------------------------------------ auth
  const login = useCallback(
    async (identifier: string, _password: string, _remember: boolean) => {
      const id = identifier.trim().toLowerCase()
      if (!id) {
        set({ loginError: 'Enter your username or email to sign in.' })
        return
      }
      const entry = Object.entries(state.accounts).find(
        ([, a]) => a.username.toLowerCase() === id || a.email.toLowerCase() === id,
      )
      if (!entry) {
        set({ loginError: 'No account matches that username or email. Ask your admin for access.' })
        return
      }
      await services.auth.login(identifier, _password)
      set({ sessionUserId: entry[0], screen: 'dashboard', loginError: '' })
    },
    [state.accounts, set],
  )

  const logout = useCallback(() => {
    void services.auth.logout()
    set({ sessionUserId: null })
  }, [set])

  const go = useCallback((screen: ScreenKey) => set({ screen, navOpen: false }), [set])

  // ------------------------------------------------------------- checklist
  const toggleTask = useCallback(
    (id: string) => {
      setState((s) => ({ ...s, tasks: { ...s.tasks, [id]: !s.tasks[id] } }))
    },
    [],
  )

  // ------------------------------------------------- documents / signatures
  const openModal = useCallback((docId: string) => set({ modal: docId }), [set])
  const closeModal = useCallback(() => set({ modal: null }), [set])

  const signMember = useCallback(
    (memberId: string) => {
      const docId = state.modal
      if (!docId) return
      void services.signatures.sign(docId, memberId)
      const cur = { ...sigFor(docId), [memberId]: true }
      setState((s) => ({ ...s, sig: { ...s.sig, [docId]: cur } }))
      const nowAll = roster().every((m) => cur[m.id])
      if (nowAll) flash('All signatures collected — board notified by email')
      else flash(memberId === state.sessionUserId ? 'You signed via DocuSeal' : 'Signature recorded')
    },
    [state.modal, state.sessionUserId, sigFor, roster, flash],
  )

  const signAll = useCallback(() => {
    const docId = state.modal
    if (!docId) return
    const cur: Record<string, boolean> = {}
    roster().forEach((m) => (cur[m.id] = true))
    setState((s) => ({ ...s, sig: { ...s.sig, [docId]: cur } }))
    flash('All signatures collected — board notified by email')
    setTimeout(() => setState((s) => ({ ...s, modal: null })), 900)
  }, [state.modal, roster, flash])

  const notifyDocSigners = useCallback(
    (docId: string) => {
      if (!state.emailConnected) {
        flash("Email isn't connected yet — ask IT to connect Hostinger in Team & Access")
        return
      }
      const sig = sigFor(docId)
      const pending = roster().filter(
        (m) => state.accounts[m.id]?.email && !sig[m.id] && m.id !== state.sessionUserId,
      )
      void services.mail.sendSignReminder(docId, pending)
      setState((s) => ({
        ...s,
        docNotified: { ...s.docNotified, [docId]: { at: fmtDate(), count: pending.length } },
      }))
      flash('Emailed ' + pending.length + ' board members to sign via DocuSeal')
    },
    [state.emailConnected, state.accounts, state.sessionUserId, sigFor, roster, flash],
  )

  // ----------------------------------------------------------------- notes
  const newNote = useCallback(() => {
    const id = 'n' + Date.now()
    setState((s) => ({
      ...s,
      notes: [{ id, title: '', body: '', updated: 'Just now' }, ...s.notes],
      activeNoteId: id,
      screen: 'notes',
    }))
  }, [])

  const updateNote = useCallback((field: 'title' | 'body', value: string) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) =>
        n.id === s.activeNoteId ? { ...n, [field]: value, updated: 'Just now' } : n,
      ),
      noteSaved: 'Saving…',
    }))
    clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(
      () => setState((s) => ({ ...s, noteSaved: 'Saved' })),
      600,
    )
  }, [])

  const deleteNote = useCallback(() => {
    setState((s) => {
      const notes = s.notes.filter((n) => n.id !== s.activeNoteId)
      return { ...s, notes, activeNoteId: notes[0] ? notes[0].id : null }
    })
  }, [])

  // --------------------------------------------------------------- motions
  const castVote = useCallback(
    (motionId: string, memberId: string, choice: VoteChoice) => {
      // Only the signed-in member with vote permission may cast their own vote.
      if (memberId !== state.sessionUserId || !currentUser?.account.vote) return
      setState((s) => ({
        ...s,
        motions: s.motions.map((m) => {
          if (m.id !== motionId) return m
          const votes = { ...m.votes }
          if (votes[memberId] === choice) delete votes[memberId]
          else votes[memberId] = choice
          return { ...m, votes }
        }),
      }))
      flash('Your vote was recorded')
    },
    [state.sessionUserId, currentUser, flash],
  )

  const createMotion = useCallback(async () => {
    const d = state.draft
    if (!d || !d.title.trim()) return
    const id = 'mo' + Date.now()
    let zoomUrl = ''
    if (state.zoomConnected) {
      zoomUrl = (await services.zoom.createMeeting()).joinUrl
    }
    const recipients = notifiableVoters()
    const notifiedAt = state.emailConnected ? fmtDate() : ''
    const linked = d.meeting ? MEETINGS.find((x) => x.id === d.meeting) : null
    let voteDay: number, voteTime: string
    if (linked) {
      voteDay = linked.day
      voteTime = linked.time
    } else {
      const used: Record<number, boolean> = {}
      allMeetings().forEach((x) => (used[x.day] = true))
      voteDay = 3
      while (voteDay < 31 && used[voteDay]) voteDay++
      voteTime = '4:00 PM'
    }
    const motion: Motion = {
      id,
      title: d.title.trim(),
      desc: d.desc.trim(),
      meeting: d.meeting,
      created: fmtDate(),
      votes: {},
      zoomUrl,
      notifiedAt,
      notifiedCount: notifiedAt ? recipients.length : 0,
      voteDay,
      voteTime,
    }
    void services.calendar.createEvent('Board vote: ' + motion.title, voteDay, voteTime)
    if (notifiedAt) void services.mail.sendVoteRequest(motion, recipients)
    setState((s) => ({ ...s, motions: [motion, ...s.motions], draft: null, screen: 'votes' }))
    let msg = 'Motion created'
    if (zoomUrl) msg += ' · Zoom vote meeting added to calendar'
    if (notifiedAt) msg += ' · ' + recipients.length + ' board members emailed'
    else msg += ' · connect email to notify the board'
    flash(msg)
  }, [state.draft, state.zoomConnected, state.emailConnected, notifiableVoters, allMeetings, flash])

  const removeMotion = useCallback((id: string) => {
    setState((s) => ({ ...s, motions: s.motions.filter((m) => m.id !== id) }))
  }, [])

  const notifyBoard = useCallback(
    (motionId: string) => {
      if (!state.emailConnected) {
        flash("Email isn't connected yet — ask IT to connect Hostinger in Team & Access")
        return
      }
      const recipients = notifiableVoters()
      const motion = state.motions.find((m) => m.id === motionId)
      if (motion) void services.mail.sendVoteRequest(motion, recipients)
      setState((s) => ({
        ...s,
        motions: s.motions.map((m) =>
          m.id === motionId ? { ...m, notifiedAt: fmtDate(), notifiedCount: recipients.length } : m,
        ),
      }))
      flash('Emailed ' + recipients.length + ' board members to review & vote')
    },
    [state.emailConnected, state.motions, notifiableVoters, flash],
  )

  // ------------------------------------------------------------ AI drafting
  const startDraft = useCallback(
    async (motionId: string, _regen?: boolean) => {
      const mo = state.motions.find((m) => m.id === motionId)
      if (!mo) return
      set({ drafting: { motionId, motionTitle: mo.title, status: 'loading', title: '', body: '' } })
      const meeting = mo.meeting ? MEETINGS.find((x) => x.id === mo.meeting) : undefined
      try {
        const text = await services.draft.draftMotionDocument({
          motionTitle: mo.title,
          motionDesc: mo.desc,
          meetingTitle: meeting?.title,
        })
        const title = mo.title.replace(/^Adopt (the )?/i, '').replace(/^Approve (the )?/i, '')
        setState((s) =>
          s.drafting && s.drafting.motionId === motionId
            ? {
                ...s,
                drafting: {
                  motionId,
                  motionTitle: mo.title,
                  status: 'ready',
                  title: title.charAt(0).toUpperCase() + title.slice(1),
                  body: text.trim(),
                },
              }
            : s,
        )
      } catch {
        setState((s) => ({
          ...s,
          drafting: {
            motionId,
            motionTitle: mo.title,
            status: 'ready',
            title: mo.title,
            body: 'The AI draft could not be generated right now. You can write the document here manually, then send it to DocuSeal for signing.',
          },
        }))
      }
    },
    [state.motions, set],
  )

  const sendDraftToDocuSeal = useCallback(() => {
    const dr = state.drafting
    if (!dr) return
    const docId = 'aidoc' + Date.now()
    const doc: PortalDoc = {
      id: docId,
      name: (dr.title || 'Board document').trim(),
      cat: 'Governance',
      updated: fmtDate(),
      pages: Math.max(1, Math.round(dr.body.length / 1800)),
      desc: 'AI-drafted document enacting a board motion. Review with counsel before it is relied upon.',
      todo: "Each board member signs in DocuSeal. Once all have signed, it's complete and filed.",
      body: dr.body,
    }
    void services.signatures.createSubmission(docId, roster())
    setState((s) => ({
      ...s,
      customDocs: [...s.customDocs, doc],
      motions: s.motions.map((m) => (m.id === dr.motionId ? { ...m, docId } : m)),
      drafting: null,
      modal: docId,
    }))
    flash('Document sent to DocuSeal for all board members to sign')
  }, [state.drafting, roster, flash])

  // ---------------------------------------------------------- team & access
  const manageMember = useCallback(
    (id: string) => {
      const a = state.accounts[id]
      set({
        acct: {
          id,
          email: a?.email || '',
          username: a?.username || '',
          pw: '',
          status: a?.status || 'none',
          vote: a ? a.vote : true,
          sign: a ? a.sign : true,
        },
      })
    },
    [state.accounts, set],
  )

  const addMember = useCallback(() => {
    const id = 'mem' + Date.now()
    setState((s) => ({
      ...s,
      extraMembers: [...s.extraMembers, { id, name: 'New board member', role: 'Director', initials: 'NM' }],
      acct: { id, email: '', username: '', pw: '', status: 'none', vote: true, sign: true, isNew: true },
    }))
  }, [])

  const genPw = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let p = ''
    for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
    setState((s) => (s.acct ? { ...s, acct: { ...s.acct, pw: p } } : s))
  }, [])

  const saveAcct = useCallback(() => {
    const ac = state.acct
    if (!ac) return
    const wasNew = ac.status === 'none'
    const existing = state.accounts[ac.id]
    const entry: Account = {
      username: ac.username,
      email: ac.email,
      status: wasNew ? 'invited' : ac.status,
      vote: ac.vote,
      sign: ac.sign,
      admin: existing?.admin,
    }
    setState((s) => ({ ...s, accounts: { ...s.accounts, [ac.id]: entry }, acct: null }))
    flash(wasNew ? 'Invite sent — login details ready to share' : 'Access updated')
  }, [state.acct, state.accounts, flash])

  const revokeAcct = useCallback(() => {
    const ac = state.acct
    if (!ac) return
    setState((s) => {
      const accounts = { ...s.accounts }
      delete accounts[ac.id]
      return { ...s, accounts, acct: null }
    })
    flash('Access revoked')
  }, [state.acct, flash])

  // ------------------------------------------------------------ integrations
  const connectCal = useCallback(() => {
    void services.calendar.connect()
    set({ calConnected: true })
    flash('Google Calendar connected')
  }, [set, flash])
  const disconnectCal = useCallback(() => set({ calConnected: false }), [set])
  const connectZoom = useCallback(() => {
    void services.zoom.connect()
    set({ zoomConnected: true })
    flash('Zoom connected')
  }, [set, flash])
  const disconnectZoom = useCallback(() => set({ zoomConnected: false }), [set])
  const connectEmail = useCallback(() => {
    void services.mail.connect()
    set({ emailConnected: true })
    flash('Hostinger email connected')
  }, [set, flash])
  const disconnectEmail = useCallback(() => set({ emailConnected: false }), [set])

  const setTheme = useCallback((theme: ThemeName) => set({ theme }), [set])
  const setDashboardLayout = useCallback(
    (dashboardLayout: DashboardLayout) => set({ dashboardLayout }),
    [set],
  )

  const store: Store = {
    state,
    currentUser,
    roster,
    allMeetings,
    meetingsView,
    allDocs,
    sigFor,
    signedCountFor,
    docStatusOf,
    set,
    flash,
    setTheme,
    setDashboardLayout,
    login,
    logout,
    go,
    toggleTask,
    openModal,
    closeModal,
    signMember,
    signAll,
    notifyDocSigners,
    newNote,
    updateNote,
    deleteNote,
    castVote,
    createMotion,
    removeMotion,
    notifyBoard,
    notifiableVoters,
    startDraft,
    sendDraftToDocuSeal,
    manageMember,
    addMember,
    genPw,
    saveAcct,
    revokeAcct,
    connectCal,
    disconnectCal,
    connectZoom,
    disconnectZoom,
    connectEmail,
    disconnectEmail,
  }

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreCtx)
  if (!s) throw new Error('useStore must be used inside <StoreProvider>')
  return s
}
