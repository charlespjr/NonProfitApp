/**
 * Integration seams.
 *
 * The prototype mocked every integration (auth, DocuSeal, Google Calendar,
 * Zoom, Hostinger email, AI drafting). This module defines the interfaces the
 * app talks to and exports mock implementations with the same observable
 * behavior as the prototype. Production wires each interface to a real
 * backend endpoint — the UI never has to change.
 */
import type { Member, Motion, VoteChoice } from '../types'

export interface AuthService {
  /** Accepts username OR email + password. Resolves the member id. */
  login(identifier: string, password: string): Promise<{ memberId: string } | { error: string }>
  logout(): Promise<void>
}

export interface SignatureService {
  /** Create/refresh a DocuSeal submission for a document + signer roster. */
  createSubmission(docId: string, signers: Member[]): Promise<void>
  /** Record one signer's signature (in production: driven by webhooks). */
  sign(docId: string, memberId: string): Promise<void>
  remind(docId: string, memberIds: string[]): Promise<number>
}

export interface CalendarService {
  connect(): Promise<{ account: string }>
  disconnect(): Promise<void>
  createEvent(title: string, day: number, time: string): Promise<void>
}

export interface ZoomService {
  connect(): Promise<void>
  disconnect(): Promise<void>
  createMeeting(): Promise<{ joinUrl: string }>
}

export interface MailService {
  connect(): Promise<{ sendingAs: string }>
  disconnect(): Promise<void>
  /** Motion-vote notification to members with vote access. Returns count sent. */
  sendVoteRequest(motion: Motion, recipients: Member[]): Promise<number>
  /** DocuSeal signing reminder. Returns count sent. */
  sendSignReminder(docName: string, recipients: Member[]): Promise<number>
}

export interface DraftService {
  /** Server-side LLM endpoint in production — never call a model with
   *  client-side keys. */
  draftMotionDocument(input: {
    motionTitle: string
    motionDesc: string
    meetingTitle?: string
  }): Promise<string>
}

export interface VoteService {
  cast(motionId: string, memberId: string, choice: VoteChoice | null): Promise<void>
}

// ---------------------------------------------------------------------------
// Mock implementations (prototype behavior). Swap these for API-backed ones.
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export const mockAuth: AuthService = {
  async login() {
    // Resolved by the store against the accounts map; the mock never rejects.
    return { memberId: 'alitalia' }
  },
  async logout() {},
}

export const mockSignatures: SignatureService = {
  async createSubmission() {},
  async sign() {},
  async remind(_docId, memberIds) {
    return memberIds.length
  },
}

export const mockCalendar: CalendarService = {
  async connect() {
    return { account: 'alitalia@adamsinfinitelegacy.org' }
  },
  async disconnect() {},
  async createEvent() {},
}

export const mockZoom: ZoomService = {
  async connect() {},
  async disconnect() {},
  async createMeeting() {
    return { joinUrl: 'https://zoom.us/j/' + (8400000000 + Math.floor(Math.random() * 8999999)) }
  },
}

export const mockMail: MailService = {
  async connect() {
    return { sendingAs: 'admin@adamsinfinitelegacy.org' }
  },
  async disconnect() {},
  async sendVoteRequest(_motion, recipients) {
    return recipients.length
  },
  async sendSignReminder(_docName, recipients) {
    return recipients.length
  },
}

export const mockDraft: DraftService = {
  async draftMotionDocument({ motionTitle, motionDesc, meetingTitle }) {
    await delay(1400)
    const effective = 'July 1, 2026'
    return [
      'BOARD RESOLUTION OF ADAMS INFINITE LEGACY',
      'A California Nonprofit Public Benefit Corporation',
      '',
      'RECITALS',
      '',
      `WHEREAS, the Board of Directors of Adams Infinite Legacy (the "Corporation") has considered the following motion: ${motionTitle};`,
      motionDesc ? `WHEREAS, the Board received the following details in support of the motion: ${motionDesc};` : 'WHEREAS, the Board discussed the motion and its effect on the Corporation;',
      meetingTitle ? `WHEREAS, the motion was discussed at the meeting titled "${meetingTitle}";` : 'WHEREAS, the motion was posted to the Board for a vote through the Corporation’s board portal;',
      '',
      'RESOLUTIONS',
      '',
      `RESOLVED, that the Board of Directors hereby approves and adopts the motion: ${motionTitle}.`,
      'RESOLVED FURTHER, that the officers of the Corporation are authorized and directed to take all actions reasonably necessary to carry this resolution into effect.',
      '',
      `EFFECTIVE DATE: ${effective}`,
      '',
      'SIGNATURES OF THE DIRECTORS',
      '',
      'Alitalia Adams, President & Founder            Date: [____]',
      'Judy Adams, Vice Chair                         Date: [____]',
      'Lee Taylor II, Treasurer                       Date: [____]',
      'Courtney Woo, Secretary                        Date: [____]',
      'Charles Pleasant, Chief Information Officer    Date: [____]',
      'Joe Grumbine, Community Health Education Chair Date: [____]',
      'Nancy Hughes, Philanthropy Chair               Date: [____]',
    ].join('\n')
  },
}
