export type ThemeName = 'premium' | 'warm' | 'clinical'
export type DashboardLayout = 'Overview grid' | 'Two-column feed'
export type ScreenKey =
  | 'dashboard'
  | 'documents'
  | 'checklist'
  | 'votes'
  | 'calendar'
  | 'notes'
  | 'team'

export type VoteChoice = 'for' | 'against' | 'abstain'
export type DocCategory = 'Governance' | 'Fundraising' | 'Donor Letters'
export type DocStatus = 'draft' | 'sent' | 'signed'
export type AccountStatus = 'active' | 'invited' | 'none'

export interface Member {
  id: string
  name: string
  role: string
  initials: string
}

export interface Account {
  username: string
  /** The member's personal email — where DocuSeal delivers documents. */
  email: string
  status: AccountStatus
  vote: boolean
  sign: boolean
  /** Admins manage Team & Access, draft documents, and connect integrations. */
  admin?: boolean
}

export interface PortalDoc {
  id: string
  name: string
  cat: DocCategory
  updated: string
  pages: number
  /** Present on AI-drafted documents appended at runtime. */
  desc?: string
  todo?: string
  body?: string
}

export interface DocInfo {
  desc: string
  todo: string
}

export interface ChecklistItem {
  id: string
  label: string
  doc?: string
}

export interface ChecklistPhase {
  name: string
  items: ChecklistItem[]
}

export interface Meeting {
  id: string
  title: string
  day: number
  time: string
  who: string
  zoom?: boolean
  zoomUrl?: string
  isVote?: boolean
}

export interface Motion {
  id: string
  title: string
  desc: string
  meeting: string
  created: string
  votes: Record<string, VoteChoice>
  docId?: string
  zoomUrl?: string
  voteDay?: number
  voteTime?: string
  notifiedAt?: string
  notifiedCount?: number
}

export interface Note {
  id: string
  title: string
  body: string
  updated: string
}

export interface DraftingState {
  motionId: string
  motionTitle: string
  status: 'loading' | 'ready'
  title: string
  body: string
}

export interface AcctForm {
  id: string
  /** Editable only when creating a new member in api mode. */
  name?: string
  username: string
  email: string
  pw: string
  status: AccountStatus
  vote: boolean
  sign: boolean
  isNew?: boolean
}

export interface MotionDraftForm {
  title: string
  desc: string
  meeting: string
}

export interface DocNotifiedEntry {
  at: string
  count: number
}

/** Everything persisted between sessions. */
export interface PersistedState {
  sessionUserId: string | null
  screen: ScreenKey
  /** ISO date the org opened its portal — anchors trial & compliance deadlines. */
  startDate: string
  sig: Record<string, Record<string, boolean>>
  docNotified: Record<string, DocNotifiedEntry>
  tasks: Record<string, boolean>
  notes: Note[]
  activeNoteId: string | null
  calConnected: boolean
  emailConnected: boolean
  /** Which provider the foundation mailbox lives with (google, microsoft, …). */
  emailProvider: string
  /** The address DocuSeal invitations are sent from. */
  emailAddress: string
  zoomConnected: boolean
  motions: Motion[]
  accounts: Record<string, Account>
  extraMembers: Member[]
  customDocs: PortalDoc[]
  theme: ThemeName
  dashboardLayout: DashboardLayout
  /** Admin hid the "Get set up" guide on the dashboard. */
  setupDismissed: boolean
}

export interface UiState {
  search: string
  docCat: 'All' | DocCategory
  modal: string | null
  toast: string
  draft: MotionDraftForm | null
  drafting: DraftingState | null
  emailPreview: string | null
  acct: AcctForm | null
  navOpen: boolean
  noteSaved: 'Saved' | 'Saving…'
  loginError: string
  /** Upgrade prompt shown when a free-preview org tries to make changes. */
  upgradeOpen: boolean
}

export type AppState = PersistedState & UiState

export interface CurrentUser {
  member: Member
  account: Account
  isAdmin: boolean
}
