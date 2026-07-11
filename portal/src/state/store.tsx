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
import { api, ApiError, type ApiMember, type ApiOrg, type ApiSession } from '../services/api'
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
  /** 'demo' = static hosting with seeded accounts; 'api' = real backend. */
  mode: 'checking' | 'api' | 'demo'
  apiOrg: ApiOrg | null
  apiMe: ApiMember | null

  // auth (api mode)
  register(input: { orgName: string; name: string; email: string; username: string; password: string }): Promise<void>
  changePassword(password: string): Promise<void>

  // billing (api mode)
  checkout(tier: 'starter' | 'growth' | 'scale' | 'launch_partner', period?: 'monthly' | 'yearly'): Promise<void>
  openBillingPortal(): Promise<void>

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

/** The slice of state that syncs to the server per-org in api mode. */
const BOARD_KEYS = [
  'sig',
  'docNotified',
  'tasks',
  'notes',
  'activeNoteId',
  'calConnected',
  'emailConnected',
  'zoomConnected',
  'motions',
  'customDocs',
  'theme',
  'dashboardLayout',
] as const

type BoardSlice = Pick<AppState, (typeof BOARD_KEYS)[number]>

function boardSlice(state: AppState): BoardSlice {
  const out = {} as Record<string, unknown>
  for (const k of BOARD_KEYS) out[k] = state[k]
  return out as BoardSlice
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({ ...loadPersisted(), ...defaultUi }))
  const [mode, setMode] = useState<'checking' | 'api' | 'demo'>('checking')
  const [apiOrg, setApiOrg] = useState<ApiOrg | null>(null)
  const [apiMe, setApiMe] = useState<ApiMember | null>(null)
  const [apiMembers, setApiMembers] = useState<ApiMember[]>([])
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()
  const noteTimer = useRef<ReturnType<typeof setTimeout>>()
  const syncTimer = useRef<ReturnType<typeof setTimeout>>()
  const versionRef = useRef(0)
  const hydratingRef = useRef(false)

  const accountsFrom = (list: ApiMember[]): Record<string, Account> => {
    const accounts: Record<string, Account> = {}
    for (const m of list) {
      accounts[m.id] = {
        username: m.username,
        email: m.email,
        status: m.status,
        vote: m.canVote,
        sign: m.canSign,
        admin: m.isAdmin,
      }
    }
    return accounts
  }

  const hydrateSession = useCallback(async (sess: ApiSession) => {
    hydratingRef.current = true
    const [{ data, version }, { members }] = await Promise.all([api.getState(), api.members()])
    versionRef.current = version
    setApiOrg(sess.org)
    setApiMe(sess.me)
    setApiMembers(members)
    setState((s) => ({
      ...s,
      ...defaultUi,
      // server board state overrides local; unset keys fall back to clean defaults
      sig: {},
      docNotified: {},
      tasks: {},
      notes: [],
      activeNoteId: null,
      calConnected: false,
      emailConnected: false,
      zoomConnected: false,
      motions: [],
      customDocs: [],
      ...(data as Partial<BoardSlice>),
      accounts: accountsFrom(members),
      extraMembers: [],
      sessionUserId: sess.me.id,
      screen: 'dashboard',
    }))
    // allow the persist effect to run again after this render settles
    setTimeout(() => (hydratingRef.current = false), 0)
  }, [])

  // Boot: decide api vs demo mode once.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const detected = await api.detectMode()
      if (cancelled) return
      if (detected === 'demo') {
        setMode('demo')
        return
      }
      try {
        const sess = await api.me()
        if (cancelled) return
        await hydrateSession(sess)
      } catch {
        if (!cancelled) setState((s) => ({ ...s, sessionUserId: null }))
      }
      if (!cancelled) setMode('api')
    })()
    return () => {
      cancelled = true
    }
  }, [hydrateSession])

  // Persistence. Demo mode: localStorage (original behavior). Api mode:
  // debounced PUT of the board slice with optimistic versioning.
  useEffect(() => {
    if (mode === 'demo') {
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
      return
    }
    if (mode !== 'api' || !state.sessionUserId || hydratingRef.current) return
    const snapshot = boardSlice(state)
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(async () => {
      try {
        const { version } = await api.putState(snapshot as Record<string, unknown>, versionRef.current)
        versionRef.current = version
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          // Someone else (another board member) wrote first — take the
          // server's copy. Last-write-wins is acceptable for this state.
          try {
            const { data, version } = await api.getState()
            versionRef.current = version
            hydratingRef.current = true
            setState((s) => ({ ...s, ...(data as Partial<BoardSlice>) }))
            setTimeout(() => (hydratingRef.current = false), 0)
          } catch {
            /* offline — retry on next change */
          }
        }
      }
    }, 700)
  }, [state, mode])

  const set = useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }))
  }, [])

  const flash = useCallback((msg: string) => {
    setState((s) => ({ ...s, toast: msg }))
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: '' })), 2200)
  }, [])

  const roster = useCallback((): Member[] => {
    if (mode === 'api') {
      return apiMembers.map((m) => ({ id: m.id, name: m.name, role: m.roleTitle, initials: m.initials }))
    }
    return MEMBERS.concat(state.extraMembers)
  }, [mode, apiMembers, state.extraMembers])

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
    async (identifier: string, password: string, _remember: boolean) => {
      const id = identifier.trim().toLowerCase()
      if (!id) {
        set({ loginError: 'Enter your username or email to sign in.' })
        return
      }
      if (mode === 'api') {
        try {
          const sess = await api.login(identifier, password)
          await hydrateSession(sess)
        } catch (e) {
          set({ loginError: e instanceof ApiError ? e.message : 'Could not reach the server — try again.' })
        }
        return
      }
      const entry = Object.entries(state.accounts).find(
        ([, a]) => a.username.toLowerCase() === id || a.email.toLowerCase() === id,
      )
      if (!entry) {
        set({ loginError: 'No account matches that username or email. Ask your admin for access.' })
        return
      }
      await services.auth.login(identifier, password)
      set({ sessionUserId: entry[0], screen: 'dashboard', loginError: '' })
    },
    [mode, state.accounts, set, hydrateSession],
  )

  const register = useCallback(
    async (input: { orgName: string; name: string; email: string; username: string; password: string }) => {
      if (mode !== 'api') {
        set({ loginError: 'Registration needs the backend — this static demo uses the seeded accounts.' })
        return
      }
      try {
        const sess = await api.register(input)
        await hydrateSession(sess)
      } catch (e) {
        set({ loginError: e instanceof ApiError ? e.message : 'Could not reach the server — try again.' })
      }
    },
    [mode, set, hydrateSession],
  )

  const changePassword = useCallback(
    async (password: string) => {
      if (mode !== 'api') return
      await api.changePassword(password)
      setApiMe((m) => (m ? { ...m, mustChangePassword: false } : m))
      flash('Password updated')
    },
    [mode, flash],
  )

  const logout = useCallback(() => {
    if (mode === 'api') {
      void api.logout()
      setApiMe(null)
      setApiOrg(null)
      setApiMembers([])
      versionRef.current = 0
      setState((s) => ({ ...s, ...defaultUi, sessionUserId: null }))
      return
    }
    void services.auth.logout()
    set({ sessionUserId: null })
  }, [mode, set])

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
    if (mode === 'api') {
      set({ acct: { id: '', name: '', email: '', username: '', pw: '', status: 'none', vote: true, sign: false, isNew: true } })
      return
    }
    const id = 'mem' + Date.now()
    setState((s) => ({
      ...s,
      extraMembers: [...s.extraMembers, { id, name: 'New board member', role: 'Director', initials: 'NM' }],
      acct: { id, email: '', username: '', pw: '', status: 'none', vote: true, sign: true, isNew: true },
    }))
  }, [mode, set])

  const genPw = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let p = ''
    for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
    setState((s) => (s.acct ? { ...s, acct: { ...s.acct, pw: p } } : s))
  }, [])

  const refreshMembers = useCallback(async () => {
    const { members } = await api.members()
    setApiMembers(members)
    setState((s) => ({ ...s, accounts: accountsFrom(members) }))
  }, [])

  const saveAcct = useCallback(async () => {
    const ac = state.acct
    if (!ac) return
    if (mode === 'api') {
      try {
        if (ac.isNew) {
          if (!(ac.name || '').trim()) {
            flash('Enter the member’s name')
            return
          }
          await api.createMember({
            name: ac.name!.trim(),
            username: ac.username,
            email: ac.email,
            password: ac.pw || undefined,
            canVote: ac.vote,
            canSign: ac.sign,
          })
        } else {
          await api.updateMember(ac.id, {
            username: ac.username,
            email: ac.email,
            canVote: ac.vote,
            canSign: ac.sign,
            ...(ac.pw ? { password: ac.pw } : {}),
          })
        }
        await refreshMembers()
        set({ acct: null })
        flash(ac.isNew ? 'Invite sent — login details ready to share' : 'Access updated')
      } catch (e) {
        flash(e instanceof ApiError ? e.message : 'Could not save — try again')
      }
      return
    }
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
  }, [mode, state.acct, state.accounts, flash, set, refreshMembers])

  const revokeAcct = useCallback(async () => {
    const ac = state.acct
    if (!ac) return
    if (mode === 'api') {
      try {
        await api.deleteMember(ac.id)
        await refreshMembers()
        set({ acct: null })
        flash('Access revoked')
      } catch (e) {
        flash(e instanceof ApiError ? e.message : 'Could not revoke — try again')
      }
      return
    }
    setState((s) => {
      const accounts = { ...s.accounts }
      delete accounts[ac.id]
      return { ...s, accounts, acct: null }
    })
    flash('Access revoked')
  }, [mode, state.acct, flash, set, refreshMembers])

  // -------------------------------------------------------------- billing
  const checkout = useCallback(
    async (tier: 'starter' | 'growth' | 'scale' | 'launch_partner', period: 'monthly' | 'yearly' = 'monthly') => {
      try {
        const { url } = await api.checkout(tier, period)
        window.open(url, '_blank', 'noopener')
      } catch (e) {
        flash(e instanceof ApiError && e.status === 503
          ? 'Billing isn’t configured yet — payment links coming shortly.'
          : 'Could not start checkout — try again.')
      }
    },
    [flash],
  )

  const openBillingPortal = useCallback(async () => {
    try {
      const { url } = await api.billingPortal()
      window.location.href = url
    } catch (e) {
      flash(e instanceof ApiError ? e.message : 'Could not open the billing portal.')
    }
  }, [flash])

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
    mode,
    apiOrg,
    apiMe,
    register,
    changePassword,
    checkout,
    openBillingPortal,
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
