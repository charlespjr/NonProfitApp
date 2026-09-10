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
/** The kind of organization a portal serves — drives checklist, documents,
 *  and terminology. */
export type EntityType = 'nonprofit' | 'c_corp' | 'llc'
export type DocCategory =
  | 'Governance'
  | 'Fundraising'
  | 'Donor Letters'
  | 'Equity'
  | 'Compliance'
  | 'Formation'
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

/** A member's electronic signature on a document — captured natively in the
 *  portal (typed or drawn), with the consent + timestamp that make it a valid
 *  e-signature under ESIGN/UETA. */
export interface SignatureRecord {
  memberId: string
  /** The signer's name as it stood when they signed. */
  name: string
  method: 'typed' | 'drawn'
  /** Typed: the name text. Drawn: a PNG data-URL of the strokes. */
  value: string
  /** ISO timestamp of when the signature was applied. */
  signedAt: string
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
  /** The member's role / title (e.g. "CEO", "Treasurer"). */
  role?: string
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

/** Form state for adding an organization's own document to the library. */
export interface DocForm {
  name: string
  cat: DocCategory
  desc: string
  body: string
}

export interface DocNotifiedEntry {
  at: string
  count: number
}

/** Everything persisted between sessions. */
export interface PersistedState {
  sessionUserId: string | null
  screen: ScreenKey
  sig: Record<string, Record<string, boolean>>
  /** Rich electronic-signature records, keyed docId → memberId. Parallels
   *  `sig` (which stays the quick signed/not-signed status map). */
  signatures: Record<string, Record<string, SignatureRecord>>
  docNotified: Record<string, DocNotifiedEntry>
  tasks: Record<string, boolean>
  notes: Note[]
  activeNoteId: string | null
  calConnected: boolean
  /** Which calendar the org syncs to (google, microsoft, apple, ics). */
  calProvider: string
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
  /** The organization's logo as a compact data-URL ('' = none). Shown in
   *  the sidebar and on document/email letterheads. */
  orgLogo: string
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
  docForm: DocForm | null
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
