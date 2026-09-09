/**
 * Entity types the portal serves. Each carries its own launch checklist,
 * document library, and terminology. The nonprofit set reuses the original
 * seed content; C Corp and LLC add their own.
 *
 * All document bodies are starter templates with [BRACKETED] fill-ins and an
 * attorney-review reminder — the store's brand() swaps the org name in.
 */
import type { ChecklistPhase, DocInfo, EntityType, PortalDoc } from '../types'
import {
  BASE_DOCS as NP_DOCS,
  DOC_BODIES as NP_BODIES,
  DOC_INFO as NP_INFO,
  PHASES as NP_PHASES,
  TASK_HELP as NP_HELP,
} from './seed'

export interface EntityConfig {
  key: EntityType
  label: string
  shortLabel: string
  blurb: string
  /** "foundation" / "company" — the org itself, lowercase. */
  orgNoun: string
  orgNounCap: string
  /** A person on the governing body. */
  memberNoun: string
  memberNounPlural: string
  /** The governing body as a whole ("board", "members"). */
  boardNoun: string
  /** Example motion title shown as a placeholder. */
  motionExample: string
  phases: ChecklistPhase[]
  taskHelp: Record<string, string>
  baseDocs: PortalDoc[]
  docInfo: Record<string, DocInfo>
  docBodies: Record<string, string>
}

// ─────────────────────────────────────────────────────────── C CORPORATION
const CCORP_PHASES: ChecklistPhase[] = [
  {
    name: 'Form the Corporation & Get Your Tax ID',
    items: [
      { id: 'articles', label: 'File the Articles of Incorporation with the Secretary of State' },
      { id: 'regagent', label: 'Appoint a registered agent for service of process' },
      { id: 'ein', label: 'Obtain a federal Employer Identification Number (IRS Form SS-4)' },
    ],
  },
  {
    name: 'Organize the Company',
    items: [
      { id: 'orgmeeting', label: 'Hold the organizational meeting of the incorporator & Board' },
      { id: 'bylaws', label: 'Adopt the corporate Bylaws', doc: 'bylaws' },
      { id: 'directors', label: 'Elect the initial Board of Directors' },
      { id: 'officers', label: 'Appoint officers (CEO, CFO/Treasurer, Secretary)' },
      { id: 'office', label: "Set the corporation's principal office address" },
      { id: 'fiscalyear', label: 'Establish the fiscal year-end' },
      { id: 'minutes', label: 'Approve & sign the Organizational Board Minutes', doc: 'minutes' },
    ],
  },
  {
    name: 'Issue Stock & Set Up Equity',
    items: [
      { id: 'authorize', label: 'Authorize shares and approve the stock plan by board resolution', doc: 'boardconsent' },
      { id: 'issue', label: 'Issue founder stock via Stock Purchase Agreements', doc: 'stockpurchase' },
      { id: 'ip', label: 'Have founders sign IP / invention assignment agreements', doc: 'ipassign' },
      { id: 'election83b', label: 'File 83(b) elections within 30 days (if stock vests)' },
      { id: 'captable', label: 'Record the capitalization table', doc: 'captable' },
    ],
  },
  {
    name: 'Banking, Tax & Licenses',
    items: [
      { id: 'bank', label: 'Open a corporate bank account & designate signatories' },
      { id: 'statetax', label: 'Register for state taxes and employer accounts' },
      { id: 'licenses', label: 'Obtain required business licenses & permits' },
      { id: 'scorp', label: 'Discuss an S-corp election (Form 2553) with your accountant' },
    ],
  },
  {
    name: 'Stay Compliant',
    items: [
      { id: 'si', label: 'File the initial Statement of Information / annual report' },
      { id: 'franchise', label: 'Calendar franchise tax and annual report deadlines' },
      { id: 'insurance', label: 'Obtain business insurance (general liability, D&O)' },
    ],
  },
]

const CCORP_HELP: Record<string, string> = {
  articles: "File the Articles of Incorporation with your state's Secretary of State. This legally creates the corporation. Choose the state carefully — Delaware is common for startups raising venture capital; your home state is simpler and cheaper if you're not.",
  regagent: 'Name a registered agent with a physical address in the state of incorporation to receive legal notices. You can be your own agent, or use a commercial service.',
  ein: "Apply for a free EIN (the company's tax ID) at IRS.gov — search 'apply for EIN online.' Takes about 10 minutes. You'll need it for the bank account, payroll, and taxes.",
  orgmeeting: 'Hold the first meeting (or written action) of the incorporator and initial board to adopt bylaws, elect directors, appoint officers, and authorize stock. Record everything in the minutes.',
  bylaws: 'The bylaws are the internal rulebook — how the board and shareholders act, meeting and quorum rules, officer duties. Have counsel review, then the board adopts them.',
  directors: 'Formally elect the people who will serve on the Board of Directors and record them in the minutes. Directors vote on major decisions and sign key documents.',
  officers: 'Appoint the officers who run day-to-day operations — typically a CEO/President, a CFO or Treasurer, and a Secretary — and record them in the minutes.',
  office: 'Record the principal office address in the bylaws and minutes.',
  fiscalyear: "Choose the corporation's fiscal year-end (December 31 is the common default). This sets when tax returns and reports are due.",
  minutes: 'Finish the organizational minutes with the real decisions and dates. The Secretary and Chair sign them; keep them in the corporate records.',
  authorize: 'By board resolution, authorize the total number of shares, set the par value, and approve any equity incentive plan before issuing any stock.',
  issue: 'Issue founder shares through Stock Purchase Agreements that state the price, number of shares, and any vesting. Founders pay for their shares (often par value) and the company records the issuance.',
  ip: "Every founder and early employee signs a Confidential Information & Invention Assignment Agreement so the company — not the individual — owns the work. Investors require this.",
  election83b: 'If founder stock is subject to vesting, each founder should file an 83(b) election with the IRS within 30 days of issuance. Missing this deadline can create a large future tax bill — talk to your accountant immediately.',
  captable: 'Maintain the capitalization table — who owns what, how many shares, and what percentage. Keep it current every time you issue stock or options.',
  bank: 'Take your stamped Articles, EIN letter, and signed board banking resolution to a bank and open the corporate account. Name who is authorized to sign.',
  statetax: 'Register with your state tax agency for income/franchise tax, sales tax (if you sell taxable goods), and employer withholding if you have employees.',
  licenses: 'Get the city, county, and state business licenses and permits your industry requires before you operate.',
  scorp: 'A C corp can elect S-corp tax treatment (Form 2553) to avoid double taxation in some cases — but it caps shareholders and share classes. Decide with your accountant; VC-backed startups usually stay C corp.',
  si: 'File the initial Statement of Information (or your state\'s equivalent annual report) listing officers, directors, and the agent — usually due within 90 days of incorporating, then periodically.',
  franchise: 'Put annual franchise tax and report deadlines on the calendar. Missing them can suspend the corporation.',
  insurance: 'Get general liability coverage and, if you have a board or investors, Directors & Officers (D&O) insurance.',
}

const CCORP_DOCS: PortalDoc[] = [
  { id: 'bylaws', name: 'Corporate Bylaws', cat: 'Governance', updated: 'Draft', pages: 14 },
  { id: 'minutes', name: 'Organizational Board Minutes', cat: 'Governance', updated: 'Draft', pages: 4 },
  { id: 'boardconsent', name: 'Board Action & Written Consent', cat: 'Governance', updated: 'Draft', pages: 3 },
  { id: 'stockpurchase', name: 'Founder Stock Purchase Agreement', cat: 'Equity', updated: 'Draft', pages: 6 },
  { id: 'ipassign', name: 'Invention & IP Assignment Agreement', cat: 'Equity', updated: 'Draft', pages: 5 },
  { id: 'captable', name: 'Capitalization Table', cat: 'Equity', updated: 'Draft', pages: 1 },
  { id: 'boardvote', name: 'Board Resolution & Vote', cat: 'Governance', updated: 'Draft', pages: 2 },
]

const CCORP_INFO: Record<string, DocInfo> = {
  bylaws: { desc: 'The internal rulebook for the corporation — board and shareholder meetings, quorum, voting, officer roles, and stock mechanics.', todo: 'Have corporate counsel review, then the board adopts and the Secretary certifies it. Keep it in the corporate records.' },
  minutes: { desc: 'The official record of the first (organizational) board meeting — adopting bylaws, electing directors, appointing officers, and authorizing stock.', todo: 'Confirm the dates and decisions, then the Secretary and Chair sign, and route to all directors electronically.' },
  boardconsent: { desc: 'A written consent the directors sign to approve an action (authorizing shares, opening banking, approving an equity plan) without holding a meeting.', todo: 'Describe the action, then route to all directors to sign electronically.' },
  stockpurchase: { desc: 'The agreement that issues founder shares — price, number of shares, and any vesting schedule and repurchase terms.', todo: 'Fill in each founder\'s shares, price, and vesting; the company and founder sign; remember the 83(b) election.' },
  ipassign: { desc: 'Assigns each founder\'s and employee\'s work product and inventions to the company. Investors and acquirers require this for everyone.', todo: 'Every founder and early hire signs before doing company work. Route to each person electronically.' },
  captable: { desc: 'The ownership ledger — who holds how many shares and what percentage, including options and reserved pools.', todo: 'Update it every time shares or options are issued. Keep it as the single source of truth on ownership.' },
  boardvote: { desc: 'A reusable record of a board decision, approved either by vote at a meeting or by unanimous written consent.', todo: 'Describe the matter and how it was approved, then the directors sign to record the decision.' },
}

const CCORP_BODIES: Record<string, string> = {
  bylaws: `BYLAWS OF ADAMS INFINITE LEGACY
A [STATE] Corporation

DRAFT FOR REVIEW — to be reviewed by qualified corporate counsel prior to adoption.

ARTICLE I — OFFICES
1.1 Principal Office. The principal office of the corporation is located at [ADDRESS].
1.2 Registered Agent. The corporation shall continuously maintain a registered agent in [STATE].

ARTICLE II — SHAREHOLDERS
2.1 Annual Meeting. An annual meeting of shareholders shall be held for the election of directors and other business.
2.2 Special Meetings. Special meetings may be called by the Board, the Chair, or holders of at least [10]% of shares.
2.3 Notice. Written notice shall be given not fewer than [10] nor more than [60] days before the meeting.
2.4 Quorum. A majority of shares entitled to vote constitutes a quorum. Each share carries one vote.
2.5 Action Without a Meeting. Shareholders may act by written consent of the holders of the shares required to approve the action.

ARTICLE III — BOARD OF DIRECTORS
3.1 Powers. The business and affairs of the corporation are managed by the Board of Directors.
3.2 Number. The Board shall consist of no fewer than [1] and no more than [7] directors.
3.3 Election & Term. Directors are elected by the shareholders and serve until their successors are elected.
3.4 Meetings & Quorum. A majority of directors then in office is a quorum; action requires a majority of directors present.
3.5 Action Without a Meeting. The Board may act by unanimous written consent.

ARTICLE IV — OFFICERS
4.1 The officers are a Chief Executive Officer/President, a Chief Financial Officer/Treasurer, and a Secretary, appointed by and serving at the pleasure of the Board.

ARTICLE V — STOCK
5.1 Certificates. Shares may be certificated or uncertificated as the Board determines.
5.2 Transfer Restrictions. Shares are subject to the transfer restrictions in the Articles, these Bylaws, and any stock purchase or shareholder agreement.

ARTICLE VI — INDEMNIFICATION
6.1 The corporation shall indemnify its directors and officers to the fullest extent permitted by law.

ARTICLE VII — AMENDMENTS
7.1 These Bylaws may be adopted, amended, or repealed by the Board or the shareholders as permitted by law.

CERTIFICATE OF SECRETARY
I certify that these Bylaws were adopted by the Board of Directors of Adams Infinite Legacy on [DATE].
Secretary: ______________________   Date: [____]

[TEMPLATE — have your attorney review before adoption.]`,

  minutes: `MINUTES OF THE ORGANIZATIONAL MEETING OF THE BOARD OF DIRECTORS
ADAMS INFINITE LEGACY — A [STATE] Corporation

Date: [DATE]   Time: [TIME]   Location: [LOCATION / VIDEO CONFERENCE]
PRESENT: [LIST DIRECTORS PRESENT]. A quorum was present and the meeting was called to order.

1. INCORPORATION. The Board acknowledged the filing of the Articles of Incorporation with the [STATE] Secretary of State on [DATE].
2. BYLAWS. RESOLVED, that the Bylaws presented to the Board are adopted as the Bylaws of the corporation.
3. DIRECTORS & OFFICERS. RESOLVED, that the following are elected/appointed: CEO/President [NAME]; CFO/Treasurer [NAME]; Secretary [NAME].
4. PRINCIPAL OFFICE. RESOLVED, that the principal office is fixed at [ADDRESS].
5. FISCAL YEAR. RESOLVED, that the fiscal year ends [MONTH/DAY].
6. EIN & TAXES. RESOLVED, that the officers are authorized to obtain an EIN and make required tax registrations and elections.
7. BANK ACCOUNT. RESOLVED, that the officers are authorized to open a corporate bank account (see the banking resolution).
8. STOCK. RESOLVED, that the corporation is authorized to issue up to [NUMBER] shares of common stock at $[PAR] par value, and to issue founder shares pursuant to Stock Purchase Agreements.
9. IP ASSIGNMENT. RESOLVED, that all founders and employees shall execute invention assignment agreements.
10. RATIFICATION. RESOLVED, that prior acts of the incorporator and officers are ratified.

There being no further business, the meeting adjourned.
Secretary: ______________________   Chair: ______________________

[TEMPLATE — confirm details and have counsel review.]`,

  boardconsent: `ACTION BY WRITTEN CONSENT OF THE BOARD OF DIRECTORS
ADAMS INFINITE LEGACY

The undersigned, being all of the directors, adopt the following resolutions by written consent effective [DATE]:

RESOLVED, that [DESCRIBE THE ACTION — e.g., the corporation authorize and issue [NUMBER] shares of common stock to the founders; approve the [YEAR] Equity Incentive Plan reserving [NUMBER] shares; open a bank account at [BANK]].

RESOLVED FURTHER, that the officers are authorized to execute all documents and take all actions reasonably necessary to carry out the foregoing.

This consent may be signed in counterparts.
[EACH DIRECTOR SIGNS]   Date: [____]`,

  stockpurchase: `FOUNDER STOCK PURCHASE AGREEMENT
ADAMS INFINITE LEGACY

This Agreement is made on [DATE] between Adams Infinite Legacy (the "Company") and [FOUNDER NAME] ("Purchaser").

1. PURCHASE. The Company sells and the Purchaser buys [NUMBER] shares of common stock at $[PRICE] per share, for a total of $[AMOUNT].
2. PAYMENT. Payable by [cash / check / IP contribution] on the date of this Agreement.
3. VESTING. [No vesting] OR [The shares vest over [4] years with a [1]-year cliff; unvested shares are subject to repurchase at cost if the Purchaser's service ends.]
4. 83(b) ELECTION. The Purchaser understands they may file an 83(b) election with the IRS within 30 days and is solely responsible for doing so.
5. TRANSFER RESTRICTIONS. The shares are subject to the Company's Bylaws, a right of first refusal, and applicable securities laws.
6. IP. The Purchaser has executed the Company's Invention & IP Assignment Agreement.

COMPANY: ______________________   Date: [____]
PURCHASER: ______________________   Date: [____]

[TEMPLATE — securities-law sensitive; have your attorney review before use.]`,

  ipassign: `CONFIDENTIAL INFORMATION & INVENTION ASSIGNMENT AGREEMENT
ADAMS INFINITE LEGACY

Between Adams Infinite Legacy (the "Company") and [NAME] ("I"/"me"), effective [DATE].

1. ASSIGNMENT OF INVENTIONS. I assign to the Company all right, title, and interest in inventions, works, and other intellectual property I create that relate to the Company's business or result from my work for the Company.
2. CONFIDENTIALITY. I will hold the Company's confidential information in confidence and use it only for the Company's benefit.
3. PRIOR INVENTIONS. Anything I created before and want excluded is listed in Exhibit A ([NONE], unless listed).
4. RETURN OF MATERIALS. On separation, I will return all Company property and materials.
5. NO CONFLICT. My work for the Company does not breach any agreement with a third party.

SIGNED: ______________________   Date: [____]
FOR THE COMPANY: ______________________   Date: [____]

[TEMPLATE — have your attorney review before use.]`,

  captable: `CAPITALIZATION TABLE — ADAMS INFINITE LEGACY
As of [DATE]

AUTHORIZED SHARES: [NUMBER] common
ISSUED & OUTSTANDING:

Holder                         Shares        %        Notes
[Founder 1]                    [#]           [%]      [vesting?]
[Founder 2]                    [#]           [%]      [vesting?]
Option pool (reserved)         [#]           [%]      unissued
--------------------------------------------------------------
TOTAL ISSUED                   [#]           100%

Fully-diluted total (incl. pool): [#]

[TEMPLATE — update every time shares or options are issued. This is the single source of truth for ownership.]`,

  boardvote: `RECORD OF BOARD ACTION — ADAMS INFINITE LEGACY

Matter presented: [DESCRIBE THE DECISION]
Background: [ONE OR TWO SENTENCES OF CONTEXT]

Manner of approval (check one):
[ ] Approved by vote at a duly noticed meeting held on [DATE] — Ayes: [__] Noes: [__] Abstentions: [__]
[ ] Approved by unanimous written consent dated [DATE]

RESOLVED, that the Board approves the matter above and authorizes the officers to implement it.
[EACH DIRECTOR SIGNS]   Date: [____]`,
}

// ─────────────────────────────────────────────────────────────────── LLC
const LLC_PHASES: ChecklistPhase[] = [
  {
    name: 'Form the LLC & Get Your Tax ID',
    items: [
      { id: 'articles', label: 'File the Articles of Organization with the Secretary of State' },
      { id: 'regagent', label: 'Appoint a registered agent for service of process' },
      { id: 'ein', label: 'Obtain a federal Employer Identification Number (IRS Form SS-4)' },
    ],
  },
  {
    name: 'Organize the LLC',
    items: [
      { id: 'operating', label: 'Adopt the Operating Agreement', doc: 'operating' },
      { id: 'structure', label: 'Choose member-managed vs manager-managed & appoint any managers' },
      { id: 'members', label: 'Admit members and record ownership percentages', doc: 'ledger' },
      { id: 'contributions', label: 'Record each member’s initial capital contribution' },
      { id: 'office', label: "Set the LLC's principal office address" },
      { id: 'consent', label: 'Approve & sign the Organizational Consent of Members', doc: 'consent' },
    ],
  },
  {
    name: 'Banking, Tax & Licenses',
    items: [
      { id: 'bank', label: 'Open a business bank account & designate signatories' },
      { id: 'statetax', label: 'Register for state taxes and employer accounts' },
      { id: 'licenses', label: 'Obtain required business licenses & permits' },
      { id: 'taxclass', label: 'Choose your tax classification with your accountant (default or S-corp via Form 2553)' },
    ],
  },
  {
    name: 'Stay Compliant',
    items: [
      { id: 'si', label: 'File the initial report / Statement of Information' },
      { id: 'franchise', label: 'Calendar franchise tax and annual report deadlines' },
      { id: 'insurance', label: 'Obtain business insurance (general liability)' },
    ],
  },
]

const LLC_HELP: Record<string, string> = {
  articles: "File the Articles of Organization (some states call it a Certificate of Formation) with your Secretary of State. This legally creates the LLC.",
  regagent: 'Name a registered agent with a physical address in the state of formation to receive legal notices. You can be your own agent, or use a commercial service.',
  ein: "Apply for a free EIN at IRS.gov — search 'apply for EIN online.' Even a single-member LLC generally needs one for a bank account and taxes.",
  operating: "The Operating Agreement is the LLC's core governing document — ownership, management, voting, profit distributions, and what happens when a member leaves. Even single-member LLCs should have one. Have counsel review, then all members sign.",
  structure: 'Decide whether members run the LLC directly (member-managed) or appoint managers to run it (manager-managed), and record the choice in the Operating Agreement.',
  members: 'List each member and their ownership percentage (membership interest) in the membership ledger.',
  contributions: 'Record what each member contributed — cash, property, or services — and the value credited to their capital account.',
  office: 'Record the principal office address in the Operating Agreement.',
  consent: 'Adopt the organizational resolutions (adopt the Operating Agreement, open banking, admit members) by written consent and have all members sign.',
  bank: 'Take your stamped Articles, EIN letter, and Operating Agreement to a bank and open the business account. Keep LLC finances strictly separate from personal ones to preserve liability protection.',
  statetax: 'Register with your state tax agency for the taxes that apply — sales tax if you sell taxable goods, and employer withholding if you have employees.',
  licenses: 'Get the city, county, and state business licenses and permits your industry requires before you operate.',
  taxclass: 'By default the IRS taxes a single-member LLC as a sole proprietorship and a multi-member LLC as a partnership. You may elect corporate or S-corp treatment (Form 2553) — decide with your accountant.',
  si: "File the initial report (or Statement of Information) your state requires, listing members/managers and the agent.",
  franchise: 'Put annual franchise tax and report deadlines on the calendar. Missing them can suspend the LLC.',
  insurance: 'Get general liability coverage appropriate to your business; the LLC shields personal assets but insurance covers the business itself.',
}

const LLC_DOCS: PortalDoc[] = [
  { id: 'operating', name: 'Operating Agreement', cat: 'Governance', updated: 'Draft', pages: 16 },
  { id: 'consent', name: 'Organizational Consent of Members', cat: 'Governance', updated: 'Draft', pages: 3 },
  { id: 'ledger', name: 'Membership Ledger & Capital Contributions', cat: 'Equity', updated: 'Draft', pages: 1 },
  { id: 'memberaction', name: 'Member Action & Vote', cat: 'Governance', updated: 'Draft', pages: 2 },
]

const LLC_INFO: Record<string, DocInfo> = {
  operating: { desc: "The LLC's core governing document — ownership percentages, management structure, voting, profit and loss allocation, distributions, and member transfer/exit rules.", todo: 'Have counsel review, then all members sign electronically. Keep it with the company records — banks and investors will ask for it.' },
  consent: { desc: 'A written consent the members sign to adopt the Operating Agreement, authorize banking, admit members, and ratify organizational acts — without holding a formal meeting.', todo: 'Confirm the resolutions, then route to all members to sign electronically.' },
  ledger: { desc: 'The ownership record — each member, their membership interest (%), and the capital they contributed.', todo: 'Update it whenever a member is admitted, contributes capital, or transfers interest.' },
  memberaction: { desc: 'A reusable record of a member decision, approved by vote or by written consent per the Operating Agreement.', todo: 'Describe the matter and how it was approved, then the members sign to record the decision.' },
}

const LLC_BODIES: Record<string, string> = {
  operating: `OPERATING AGREEMENT OF ADAMS INFINITE LEGACY, LLC
A [STATE] Limited Liability Company

DRAFT FOR REVIEW — to be reviewed by qualified counsel prior to adoption.

ARTICLE I — FORMATION
1.1 Formation. The Company was formed by filing Articles of Organization with the [STATE] Secretary of State on [DATE].
1.2 Principal Office. [ADDRESS]. Registered Agent: [NAME].
1.3 Purpose. The Company may engage in any lawful business.
1.4 Term. Perpetual, unless dissolved under this Agreement.

ARTICLE II — MEMBERS & INTERESTS
2.1 Members. The members and their membership interests are set out in Exhibit A (the membership ledger).
2.2 Capital Contributions. Each member's initial contribution is stated in Exhibit A. No member is required to make additional contributions except as the members agree.
2.3 Capital Accounts. A capital account is maintained for each member.

ARTICLE III — MANAGEMENT
3.1 Structure. The Company is [member-managed / manager-managed].
3.2 Voting. Except where this Agreement or law requires more, actions are approved by members holding a majority of the membership interests. Each member votes in proportion to their interest.
3.3 Managers (if manager-managed). The manager(s) are [NAME(S)], with authority to conduct the Company's ordinary business.
3.4 Action Without a Meeting. Members/managers may act by written consent.

ARTICLE IV — DISTRIBUTIONS & ALLOCATIONS
4.1 Profits and losses are allocated to members in proportion to their interests.
4.2 Distributions are made at the times and amounts the members approve, subject to law.

ARTICLE V — TRANSFERS & EXIT
5.1 A member may not transfer their interest without the consent of members holding [a majority] of the other interests, subject to a right of first refusal.
5.2 On a member's withdrawal, death, or dissolution, the Company or remaining members may purchase the interest under the terms in this Article.

ARTICLE VI — LIABILITY & INDEMNIFICATION
6.1 No member or manager is personally liable for Company obligations solely by reason of being a member or manager.
6.2 The Company indemnifies members and managers to the fullest extent permitted by law.

ARTICLE VII — DISSOLUTION
7.1 The Company dissolves upon the members' approval or as required by law; assets are applied to liabilities, then distributed to members per their capital accounts.

ARTICLE VIII — AMENDMENTS
8.1 This Agreement may be amended by members holding [a majority] of the interests.

The members adopt this Agreement effective [DATE].
[EACH MEMBER SIGNS]   Date: [____]

[TEMPLATE — have your attorney review before adoption.]`,

  consent: `ORGANIZATIONAL CONSENT OF THE MEMBERS
ADAMS INFINITE LEGACY, LLC

The undersigned, being all of the members, adopt the following by written consent effective [DATE]:

1. ARTICLES. The members acknowledge the filing of the Articles of Organization on [DATE].
2. OPERATING AGREEMENT. RESOLVED, that the Operating Agreement presented is adopted.
3. MANAGEMENT. RESOLVED, that the Company is [member-managed / manager-managed], and [NAME(S)] are appointed as managers (if applicable).
4. EIN & TAXES. RESOLVED, that the members are authorized to obtain an EIN and make required tax registrations and elections.
5. BANK ACCOUNT. RESOLVED, that the Company open a bank account at [BANK] and that [NAME(S)] are authorized signatories.
6. MEMBERSHIP LEDGER. RESOLVED, that the membership interests and capital contributions in Exhibit A are approved.

This consent may be signed in counterparts.
[EACH MEMBER SIGNS]   Date: [____]

[TEMPLATE — have your attorney review.]`,

  ledger: `MEMBERSHIP LEDGER & CAPITAL CONTRIBUTIONS — ADAMS INFINITE LEGACY, LLC
As of [DATE]

Member                     Interest %     Capital Contributed     Contribution Type
[Member 1]                 [%]            $[AMOUNT]                [cash / property / services]
[Member 2]                 [%]            $[AMOUNT]                [cash / property / services]
-----------------------------------------------------------------------------------
TOTAL                      100%           $[TOTAL]

[TEMPLATE — update whenever a member is admitted, contributes capital, or transfers interest.]`,

  memberaction: `RECORD OF MEMBER ACTION — ADAMS INFINITE LEGACY, LLC

Matter presented: [DESCRIBE THE DECISION]
Background: [ONE OR TWO SENTENCES OF CONTEXT]

Manner of approval (check one):
[ ] Approved by vote of members holding [__]% of interests at a meeting on [DATE]
[ ] Approved by written consent dated [DATE]

RESOLVED, that the members approve the matter above and authorize the managers/officers to implement it.
[EACH MEMBER SIGNS]   Date: [____]`,
}

// ──────────────────────────────────────────────────────────────── registry
export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  nonprofit: {
    key: 'nonprofit',
    label: 'Nonprofit — 501(c)(3)',
    shortLabel: 'Nonprofit',
    blurb: 'A tax-exempt foundation or charity governed by a volunteer board of directors.',
    orgNoun: 'foundation',
    orgNounCap: 'Foundation',
    memberNoun: 'director',
    memberNounPlural: 'directors',
    boardNoun: 'board of directors',
    motionExample: 'e.g. Adopt the Bylaws of [ORG]',
    phases: NP_PHASES,
    taskHelp: NP_HELP,
    baseDocs: NP_DOCS,
    docInfo: NP_INFO,
    docBodies: NP_BODIES,
  },
  c_corp: {
    key: 'c_corp',
    label: 'C Corporation',
    shortLabel: 'C Corp',
    blurb: 'A for-profit corporation with a board of directors and shareholders — the standard for raising investment.',
    orgNoun: 'company',
    orgNounCap: 'Company',
    memberNoun: 'director',
    memberNounPlural: 'directors',
    boardNoun: 'board of directors',
    motionExample: 'e.g. Approve the [YEAR] Equity Incentive Plan',
    phases: CCORP_PHASES,
    taskHelp: CCORP_HELP,
    baseDocs: CCORP_DOCS,
    docInfo: CCORP_INFO,
    docBodies: CCORP_BODIES,
  },
  llc: {
    key: 'llc',
    label: 'LLC',
    shortLabel: 'LLC',
    blurb: 'A limited liability company owned by members, governed by an Operating Agreement.',
    orgNoun: 'company',
    orgNounCap: 'Company',
    memberNoun: 'member',
    memberNounPlural: 'members',
    boardNoun: 'members',
    motionExample: 'e.g. Approve the annual distribution to members',
    phases: LLC_PHASES,
    taskHelp: LLC_HELP,
    baseDocs: LLC_DOCS,
    docInfo: LLC_INFO,
    docBodies: LLC_BODIES,
  },
}

export const ENTITY_TYPES: EntityType[] = ['nonprofit', 'c_corp', 'llc']

export function entityConfig(t: EntityType | string | undefined): EntityConfig {
  return ENTITY_CONFIG[(t as EntityType) in ENTITY_CONFIG ? (t as EntityType) : 'nonprofit']
}
