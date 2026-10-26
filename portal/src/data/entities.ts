/**
 * Entity types the portal serves. Each carries its own launch checklist,
 * document library, and terminology. The nonprofit set reuses the original
 * seed content; C Corp and LLC add their own.
 *
 * All document bodies are starter templates with [BRACKETED] fill-ins — the
 * store's brand() swaps the org name and profile values in.
 */
import type { ChecklistPhase, DocCategory, DocInfo, EntityType, PortalDoc } from '../types'
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
  /** Categories offered when adding a custom document (entity-appropriate). */
  docCategories: DocCategory[]
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
      { id: 'omnibus', label: 'Adopt an omnibus board resolution (blanket authority)', doc: 'omnibus' },
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
      { id: 'bank', label: 'Open a corporate bank account & designate signatories', doc: 'bankingcredit' },
      { id: 'businesscredit', label: 'Set up business credit & cards (Experian, D&B/D-U-N-S, Nav, credit & fuel cards)', doc: 'bankingcredit' },
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
  bylaws: 'The bylaws are the internal rulebook — how the board and shareholders act, meeting and quorum rules, officer duties. The board adopts them.',
  directors: 'Formally elect the people who will serve on the Board of Directors and record them in the minutes. Directors vote on major decisions and sign key documents.',
  officers: 'Appoint the officers who run day-to-day operations — typically a CEO/President, a CFO or Treasurer, and a Secretary — and record them in the minutes.',
  office: 'Record the principal office address in the bylaws and minutes.',
  fiscalyear: "Choose the corporation's fiscal year-end (December 31 is the common default). This sets when tax returns and reports are due.",
  minutes: 'Finish the organizational minutes with the real decisions and dates. The Secretary and Chair sign them; keep them in the corporate records.',
  omnibus: 'Adopt a broad "omnibus" resolution that authorizes the officers to handle the corporation\'s ordinary business — banking, credit, contracts, filings. Banks and vendors often ask to see this general authority. All directors sign it.',
  authorize: 'By board resolution, authorize the total number of shares, set the par value, and approve any equity incentive plan before issuing any stock.',
  issue: 'Issue founder shares through Stock Purchase Agreements that state the price, number of shares, and any vesting. Founders pay for their shares (often par value) and the company records the issuance.',
  ip: "Every founder and early employee signs a Confidential Information & Invention Assignment Agreement so the company — not the individual — owns the work. Investors require this.",
  election83b: 'If founder stock is subject to vesting, each founder should file an 83(b) election with the IRS within 30 days of issuance. Missing this deadline can create a large future tax bill — talk to your accountant immediately.',
  captable: 'Maintain the capitalization table — who owns what, how many shares, and what percentage. Keep it current every time you issue stock or options.',
  bank: 'Take your stamped Articles, EIN letter, and signed board banking resolution to a bank and open the corporate account. Name who is authorized to sign.',
  businesscredit: 'Sign the Banking & Business Credit Authorization, then use it to open a business credit card and a corporate fuel/gas card and to set up your business-credit profiles — Experian Business, a Dun & Bradstreet D-U-N-S Number, and a Nav account. Building business credit under the EIN keeps financing off personal credit over time.',
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
  { id: 'boardconsent', name: 'Board Action & Written Consent', cat: 'Governance', updated: 'Draft', pages: 3, vote: true },
  { id: 'shareholders', name: 'Shareholders’ Agreement', cat: 'Governance', updated: 'Draft', pages: 8 },
  { id: 'stockpurchase', name: 'Founder Stock Purchase Agreement', cat: 'Equity', updated: 'Draft', pages: 6 },
  { id: 'ipassign', name: 'Invention & IP Assignment Agreement', cat: 'Equity', updated: 'Draft', pages: 5 },
  { id: 'captable', name: 'Capitalization Table', cat: 'Equity', updated: 'Draft', pages: 1 },
  { id: 'boardvote', name: 'Board Resolution & Minutes (Vote)', cat: 'Governance', updated: 'Draft', pages: 2, vote: true },
  { id: 'omnibus', name: 'Omnibus Board Resolution (Blanket Authority)', cat: 'Governance', updated: 'Draft', pages: 3, vote: true },
  { id: 'bankingcredit', name: 'Banking & Business Credit Authorization', cat: 'Governance', updated: 'Draft', pages: 4, vote: true },
  { id: 'propcontribution', name: 'Resolution Accepting Contribution of Real Property', cat: 'Governance', updated: 'Draft', pages: 2, vote: true },
  { id: 'propcontribdeed', name: 'Act of Contribution of Immovable Property', cat: 'Equity', updated: 'Draft', pages: 3 },
  { id: 'est_will', name: 'Last Will & Testament', cat: 'Estate', updated: 'Draft', pages: 4 },
  { id: 'est_trust', name: 'Revocable Living Trust', cat: 'Estate', updated: 'Draft', pages: 6 },
  { id: 'est_shareassign', name: 'Assignment of FORCATA Shares to the Trust', cat: 'Estate', updated: 'Draft', pages: 3 },
  { id: 'est_poa', name: 'Durable Power of Attorney (Financial)', cat: 'Estate', updated: 'Draft', pages: 4 },
  { id: 'est_amd', name: 'Healthcare Directive / Medical POA', cat: 'Estate', updated: 'Draft', pages: 2 },
  { id: 'est_digital', name: 'Digital-Assets Authorization', cat: 'Estate', updated: 'Draft', pages: 2 },
  { id: 'est_beneficiary', name: 'Payable-on-Death / Beneficiary Forms', cat: 'Estate', updated: 'Draft', pages: 3 },
  { id: 'est_succession', name: 'Business Succession / Buy-Sell Plan', cat: 'Estate', updated: 'Draft', pages: 4, vote: true },
  { id: 'est_letter', name: 'Letter of Instruction (Estate Binder)', cat: 'Estate', updated: 'Draft', pages: 4 },
]

const CCORP_INFO: Record<string, DocInfo> = {
  bylaws: { desc: 'The internal rulebook for the corporation — board and shareholder meetings, quorum, voting, officer roles, and stock mechanics.', todo: 'The board adopts these and the Secretary certifies them. Keep it in the corporate records.' },
  minutes: { desc: 'The official record of the first (organizational) board meeting — adopting bylaws, electing directors, appointing officers, and authorizing stock.', todo: 'Confirm the dates and decisions, then the Secretary and Chair sign, and route to all directors electronically.' },
  boardconsent: { desc: 'A written consent the directors sign to approve an action (authorizing shares, opening banking, approving an equity plan) without holding a meeting.', todo: 'Describe the action, then route to all directors to sign electronically.' },
  shareholders: { desc: 'The agreement among the shareholders — share ownership, transfer restrictions (right of first refusal), tag-along and drag-along rights, board and voting rights, buy-sell on a shareholder’s departure, and confidentiality. For a corporation this is the counterpart of an LLC’s operating agreement.', todo: 'Fill in the ownership, board seats, and thresholds, attach the cap table as Exhibit A, then all shareholders sign electronically. Keep it with the corporate records.' },
  stockpurchase: { desc: 'The agreement that issues founder shares — price, number of shares, and any vesting schedule and repurchase terms.', todo: 'Fill in each founder\'s shares, price, and vesting; the company and founder sign; remember the 83(b) election.' },
  ipassign: { desc: 'Assigns each founder\'s and employee\'s work product and inventions to the company. Investors and acquirers require this for everyone.', todo: 'Every founder and early hire signs before doing company work. Route to each person electronically.' },
  captable: { desc: 'The ownership ledger — who holds how many shares and what percentage, including options and reserved pools.', todo: 'Update it every time shares or options are issued. Keep it as the single source of truth on ownership.' },
  boardvote: { desc: 'A full board resolution written as meeting minutes — title, Corporation ID, date, meeting start day/time, attendees, statement of purpose, the resolution, and a for/against vote (majority rules), with an optional notary block. Comes pre-filled with an example meeting; adjust the date, matter, and vote to your own.', todo: 'Review the pre-filled meeting details, matter, and vote and adjust them to match your meeting; the directors sign to record the decision. Notarize if the recipient requires it.' },
  omnibus: { desc: 'A broad, catch-all board resolution authorizing the officers to take any lawful action reasonably necessary to organize, fund, and operate the corporation — the general authority third parties often ask to see.', todo: 'Adopt at a meeting or by unanimous written consent; route to all directors to sign. Keep it in the corporate records to present to banks, vendors, and agencies.' },
  bankingcredit: { desc: 'Authorizes opening the corporate bank account, obtaining a business credit card and a corporate fuel/gas card, and establishing the company’s business-credit profiles with Experian Business, Dun & Bradstreet (D-U-N-S), and Nav.', todo: 'Fill in the institution and authorized-officer details, then all directors sign — banks and credit issuers routinely require this resolution.' },
  propcontribution: { desc: 'A board resolution written as meeting minutes that authorizes the Corporation to accept the contribution of inherited real property — the contributor’s undivided interests in the five Pointe Coupee Parish, Louisiana parcels acquired through the Succession of Ann Marie St. Amant Pleasant — and directs the officers to execute and record the transfer. Includes a for/against vote (majority rules) and signatures.', todo: 'Review the parcels and contribution terms, hold the vote, and have all directors sign. Keep it with the corporate records; the recorded deed to the Corporation is a separate instrument executed by the contributor.' },
  propcontribdeed: { desc: 'The deed that actually transfers title — an Act of Contribution of Immovable Property conveying the contributor’s undivided interest in the five Pointe Coupee Parish parcels to the Corporation as a contribution to capital. Because the contributor is the sole shareholder, no new shares are issued; the value is credited to additional paid-in capital. This is the instrument the board resolution authorizes. It is an act under private signature: the parties sign and acknowledge their signatures before a notary (no witnesses required), then it is recorded in Pointe Coupee Parish.', todo: 'Sign, then acknowledge your signatures before a notary; the Corporation’s officer signs to accept. Record it in Pointe Coupee Parish, keep a copy with the corporate records, and send one to the Assessor to update the ownership name.' },
  est_will: { desc: 'Pour-over will for Charles Edward Pleasant, Jr.: names Judy Ann Adams as Executor (Alitalia Adams alternate), leaves tangible property to the spouse, and pours everything else into the Revocable Living Trust. Includes attestation and a Virginia self-proving affidavit.', todo: 'Print the exported PDF and sign it before two adult witnesses who are not beneficiaries and a notary (self-proving affidavit). Keep the original with the estate binder; the Quorum copy is the record.' },
  est_trust: { desc: 'The Charles Edward Pleasant, Jr. Revocable Living Trust: everything to Judy Ann Adams outright, then to Alitalia Adams; authority to hold and run FORCATA and the other businesses; Louisiana heirs-property provisions; Judy then Alitalia as successor Trustee. Includes Schedule A and a Certification of Trust for banks.', todo: 'Sign as Grantor and Trustee before a notary; Judy signs the spousal consent. Then fund it: sign the share assignment, retitle accounts or name the Trust as POD, and assign the LLC interests on Schedule A.' },
  est_shareassign: { desc: 'Transfers 100% of the FORCATA shares into the Revocable Living Trust as a Section 2.3 Permitted Transfer under the Shareholders Agreement. No change of control and no government-contract novation is required because the Corporation remains the same entity.', todo: 'Sign individually and as Trustee before a notary; the Secretary signs the corporate acknowledgment and updates the stock ledger. Fill in the share count or certificate number.' },
  est_poa: { desc: 'Durable general power of attorney under the Virginia Uniform Power of Attorney Act naming Judy Ann Adams as Agent (Alitalia Adams successor) with full financial, business, and government-contracting authority. Specific powers (trusts, gifts, beneficiary changes, digital assets) are granted only where initialed.', todo: 'Initial the specific powers you want to grant, then sign before a notary. Give copies to the Agent and your banks; the Agent Certification page is for third parties.' },
  est_amd: { desc: 'Advance Medical Directive under the Virginia Health Care Decisions Act: Judy Ann Adams as health care Agent (Alitalia Adams successor), living-will choices, HIPAA authority, mental-health and organ-donation options.', todo: 'Initial your treatment choices, then sign before two adult witnesses (the Agent may not be a witness). No notary is needed. Give copies to your Agent and physician and keep one on your phone.' },
  est_digital: { desc: 'Written consent under the Virginia Uniform Fiduciary Access to Digital Assets Act letting your Agent, Executor, and Trustee access email, accounts, domains, Quorum, SAM.gov, banking apps, and the password manager, with an inventory of what exists and where.', todo: 'Complete the inventory table (no passwords here), sign before a notary, and store it with the sealed password envelope named in the Letter of Instruction.' },
  est_beneficiary: { desc: 'The plan for every payable-on-death, transfer-on-death, retirement, and insurance beneficiary form so each one matches the estate plan: Judy Ann Adams first, then Alitalia Adams or the Trust. Includes an account inventory and a designation request letter.', todo: 'File a beneficiary form with each institution using the exact names shown, keep each confirmation, and mark the inventory. Employer plans require the spouse as primary unless she signs a notarized waiver.' },
  est_succession: { desc: 'Who runs FORCATA and how ownership transfers if the Owner dies, is incapacitated, or exits: Judy Ann Adams as Interim CEO (Alitalia Adams alternate), shares voted through the Trust, a 180-day purchase option for successor management at appraised value, and a continuity checklist for banks, SAM.gov, and contracting officers.', todo: 'The Owner, Judy, and Alitalia sign; the board votes to adopt it here. Set the Agreed Value on Schedule B and review it every year.' },
  est_letter: { desc: 'The map for Judy and Alitalia: what is in the binder, the first 48 hours, key contacts, each business, the Pointe Coupee properties and their tax risk, where accounts and passwords are, personal wishes, and a 30/90-day checklist.', todo: 'Fill in the contacts, locations of originals, and the sealed-envelope location; sign and date; update the log whenever anything changes.' },
}

const CCORP_BODIES: Record<string, string> = {
  bylaws: `BYLAWS OF ADAMS INFINITE LEGACY
A [STATE] Corporation

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
I certify that these Bylaws were adopted by the Board of Directors of Adams Infinite Legacy on September 9, 2026.
Secretary: ______________________   Date: September 9, 2026`,

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
Secretary: ______________________   Chair: ______________________`,

  boardconsent: `ACTION BY WRITTEN CONSENT OF THE BOARD OF DIRECTORS
ADAMS INFINITE LEGACY

The undersigned, being all of the directors, adopt the following resolutions by written consent effective [DATE]:

RESOLVED, that [DESCRIBE THE ACTION — e.g., the corporation authorize and issue [NUMBER] shares of common stock to the founders; approve the [YEAR] Equity Incentive Plan reserving [NUMBER] shares; open a bank account at [BANK]].

RESOLVED FURTHER, that the officers are authorized to execute all documents and take all actions reasonably necessary to carry out the foregoing.

This consent may be signed in counterparts.
[EACH DIRECTOR SIGNS]   Date: [____]`,

  shareholders: `SHAREHOLDERS’ AGREEMENT OF ADAMS INFINITE LEGACY
A [STATE] Corporation

This Shareholders’ Agreement (this "Agreement") is entered into effective September 9, 2026 by and among Adams Infinite Legacy, a [STATE] corporation (the "Corporation"), and the persons listed on Exhibit A as holders of the Corporation’s capital stock (each a "Shareholder" and together the "Shareholders").

ARTICLE I — Shares & Parties
1.1 Shares Covered. This Agreement governs all shares of capital stock of the Corporation now or later owned by each Shareholder, including shares acquired on exercise of options or warrants.
1.2 Ownership. The name, address, and number of shares held by each Shareholder are set out in Exhibit A (the capitalization table), as updated from time to time.
1.3 Legend. Each stock certificate or book-entry notation shall bear a legend referencing the transfer restrictions in this Agreement.

ARTICLE II — Transfer Restrictions
2.1 General Restriction. No Shareholder may sell, assign, pledge, or otherwise transfer any shares except as permitted by this Agreement and applicable securities laws. Any purported transfer in violation of this Agreement is void.
2.2 Right of First Refusal. Before transferring shares to any third party, a Shareholder (the "Selling Shareholder") shall first offer them in writing to the Corporation and then to the other Shareholders pro rata, on the same price and terms offered by the third party. The Corporation and the Shareholders have 30 days to accept as to all, but not less than all, of the offered shares.
2.3 Permitted Transfers. A Shareholder may transfer shares to a wholly-owned entity or to a trust for estate-planning purposes, provided the transferee first agrees in writing to be bound by this Agreement.

ARTICLE III — Tag-Along & Drag-Along
3.1 Tag-Along Rights. If Shareholders holding a majority of the shares propose to sell to a third party, each other Shareholder may participate in that sale, on the same terms, as to a pro-rata portion of their shares.
3.2 Drag-Along Rights. If Shareholders holding at least two-thirds of the shares approve a sale of the Corporation, whether by stock sale, merger, or sale of substantially all assets, all Shareholders shall vote for and participate in that sale on the same terms.

ARTICLE IV — Governance & Voting
4.1 Board Composition. The Shareholders shall vote their shares so that the Board of Directors consists of three (3) directors, designated as set out in Exhibit A or as the Shareholders agree in writing.
4.2 Major Decisions. The following require the approval of Shareholders holding at least two-thirds of the shares: amending the Articles or Bylaws; issuing new equity; incurring debt over $25,000; selling the Corporation; or dissolving it.
4.3 Information Rights. The Corporation shall provide each Shareholder with annual financial statements and the current capitalization table.

ARTICLE V — Buy-Sell on Departure
5.1 Triggering Events. On a Shareholder’s death, disability, or termination of service, the Corporation, and then the other Shareholders pro rata, may purchase that Shareholder’s shares.
5.2 Purchase Price. The price is the fair market value of the shares as of the triggering event, determined in good faith by the Board or by an independent appraiser, unless the Shareholders have agreed on a formula in Exhibit A.
5.3 Payment Terms. The price may be paid in a lump sum or over 36 months with interest at a commercially reasonable rate, at the buyer’s election.

ARTICLE VI — Confidentiality
6.1 Confidential Information. Each Shareholder shall keep the Corporation’s confidential and proprietary information in confidence and use it only for the benefit of the Corporation.

ARTICLE VII — General
7.1 Governing Law. This Agreement is governed by the laws of the State of [STATE].
7.2 Amendments. This Agreement may be amended only in a writing signed by the Corporation and Shareholders holding at least two-thirds of the shares.
7.3 Entire Agreement. This Agreement, together with the Articles, the Bylaws, and Exhibit A, is the entire agreement among the parties on its subject matter.
7.4 Counterparts. This Agreement may be signed in counterparts, including electronically, each of which is an original.

The parties adopt this Agreement effective September 9, 2026.
Each shareholder signs below.   Date: September 9, 2026`,

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
PURCHASER: ______________________   Date: [____]`,

  ipassign: `CONFIDENTIAL INFORMATION & INVENTION ASSIGNMENT AGREEMENT
ADAMS INFINITE LEGACY

Between Adams Infinite Legacy (the "Company") and [NAME] ("I"/"me"), effective [DATE].

1. ASSIGNMENT OF INVENTIONS. I assign to the Company all right, title, and interest in inventions, works, and other intellectual property I create that relate to the Company's business or result from my work for the Company.
2. CONFIDENTIALITY. I will hold the Company's confidential information in confidence and use it only for the Company's benefit.
3. PRIOR INVENTIONS. Anything I created before and want excluded is listed in Exhibit A ([NONE], unless listed).
4. RETURN OF MATERIALS. On separation, I will return all Company property and materials.
5. NO CONFLICT. My work for the Company does not breach any agreement with a third party.

SIGNED: ______________________   Date: [____]
FOR THE COMPANY: ______________________   Date: [____]`,

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

[Update every time shares or options are issued — this is the single source of truth for ownership.]`,

  boardvote: `RESOLUTION
MINUTES
Corporation ID: [CORPORATION ID]

ADAMS INFINITE LEGACY — A [STATE] Corporation
EIN: [EIN]

Date of meeting and of this resolution: September 9, 2026

MEETING DETAILS
A meeting of the Board of Directors of Adams Infinite Legacy (the "Corporation") was duly called and held on Tuesday, September 9, 2026, at 10:00 a.m., at [ADDRESS], [CITY], [STATE] [ZIP CODE] (or by video/teleconference). A quorum being present, the meeting was called to order.

DIRECTORS PRESENT
All directors of the Corporation were present, in person or by teleconference, constituting a quorum.
Directors absent: None.
Also present: None.

STATEMENT OF PURPOSE
The Board determined that it is in the best interest of the Corporation to consider and act upon the following matter: whether to open a corporate bank account in the name of the Corporation and to designate the officers authorized to operate it.
Background: The Corporation requires a dedicated bank account to receive funds, pay obligations, and keep corporate finances separate from personal finances.

RESOLUTION
Upon motion duly made, seconded, and after discussion, it was:
RESOLVED, that the officers of the Corporation are authorized and directed to open one or more bank accounts in the name of the Corporation, to designate authorized signatories, and to take all actions and execute all documents reasonably necessary to carry it out.

VOTE (majority rules — the resolution passes only if the Ayes are a majority of the directors present)
Votes in favor (Ayes): all directors present        Votes against (Noes): 0        Abstentions: 0
Result:   [X] ADOPTED        [ ] REJECTED

There being no further business, the meeting was adjourned at 10:30 a.m.

SIGNATURES
The undersigned certify that the foregoing accurately records the action taken by the Board of Directors of the Corporation.
Each director signs below.   Date: September 9, 2026
Secretary: ______________________   Date: September 9, 2026

NOTARY ACKNOWLEDGMENT (optional)
State of [STATE]     County of [COUNTY]
Subscribed and sworn to before me this [__] day of [MONTH], [YEAR].
Notary Public: ______________________     My commission expires: [____]`,

  omnibus: `OMNIBUS RESOLUTION OF THE BOARD OF DIRECTORS
ADAMS INFINITE LEGACY — A [STATE] Corporation
(Blanket / General Authority)

The undersigned, being all of the directors of Adams Infinite Legacy (the "Corporation"), adopt the following resolutions by [unanimous written consent / vote at a meeting] effective [DATE]:

1. GENERAL AUTHORITY. RESOLVED, that the officers of the Corporation, and each of them acting alone, are authorized and empowered to take any and all actions, and to negotiate, execute, and deliver any and all agreements, instruments, certificates, and documents, that they deem necessary, appropriate, or advisable to conduct, organize, fund, and carry on the ordinary business and affairs of the Corporation, in furtherance of its lawful purposes.

2. BANKING & FINANCE. RESOLVED, that the officers are authorized to open, maintain, and close bank and financial accounts; to apply for and use credit cards, charge cards, fuel/fleet cards, and lines of credit; to borrow money and enter financing arrangements; and to designate authorized signatories, in each case on the terms they approve.

3. BUSINESS CREDIT & IDENTITY. RESOLVED, that the officers are authorized to establish and maintain the Corporation's business-credit and business-identity profiles with the credit bureaus and services the Corporation uses (including, without limitation, Experian Business, Dun & Bradstreet, and Nav), to obtain identifiers such as a D-U-N-S Number, and to submit the Corporation's information for those purposes.

4. CONTRACTS & OPERATIONS. RESOLVED, that the officers are authorized to enter contracts and leases, engage vendors and professional advisors, hire personnel, obtain insurance and licenses, and make tax and regulatory filings on the Corporation's behalf.

5. DELEGATION. RESOLVED, that the officers may delegate any of the foregoing authority to one or more officers, employees, or agents as they deem appropriate.

6. RELIANCE BY THIRD PARTIES. RESOLVED, that any bank, creditor, vendor, agency, or other third party may rely upon a copy of these resolutions, certified by the Secretary, as evidence of the officers' authority until it receives written notice of revocation from the Corporation.

7. RATIFICATION. RESOLVED, that all lawful actions previously taken by the officers in furtherance of the foregoing are ratified, confirmed, and approved.

This consent may be signed in counterparts. By signing below, each director votes for and adopts the foregoing resolutions.

[EACH DIRECTOR SIGNS]   Date: [____]

CERTIFICATE OF SECRETARY
I certify that I am the Secretary of Adams Infinite Legacy and that the foregoing resolutions were duly adopted by its Board of Directors and remain in full force and effect.
Secretary: ______________________   Date: [____]`,

  bankingcredit: `BANKING & BUSINESS CREDIT AUTHORIZATION
RESOLUTION OF THE BOARD OF DIRECTORS
ADAMS INFINITE LEGACY — A [STATE] Corporation

The undersigned, being all of the directors of Adams Infinite Legacy (the "Corporation"), adopt the following resolutions by [unanimous written consent / vote at a meeting] effective [DATE]. The Corporation's EIN is [EIN] and its principal address is [ADDRESS].

1. CORPORATE BANK ACCOUNT. RESOLVED, that the Corporation open and maintain one or more deposit accounts at [BANK NAME]; that [NAME/TITLE] and [NAME/TITLE] are designated as authorized signatories; and that disbursements over $[AMOUNT] require [one/two] authorized signature(s). The bank is authorized to honor instructions from the authorized signatories and to accept the bank's standard account and resolution forms.

2. BUSINESS CREDIT CARD. RESOLVED, that the officers are authorized to apply for and use one or more business credit or charge cards issued by [ISSUER], with an aggregate credit limit of approximately $[LIMIT], and to designate authorized cardholders and use limits.

3. CORPORATE FUEL / GAS CARD. RESOLVED, that the officers are authorized to apply for and use a corporate fuel or fleet card (e.g., [FUEL CARD PROVIDER]) for the Corporation's vehicles and fuel purchases, and to set card and spending controls.

4. EXPERIAN BUSINESS. RESOLVED, that the officers are authorized to establish and manage the Corporation's business-credit profile with Experian Business, and to submit the Corporation's identifying information for that purpose.

5. DUN & BRADSTREET. RESOLVED, that the officers are authorized to register the Corporation with Dun & Bradstreet, obtain a D-U-N-S Number, and establish and manage the Corporation's D&B business-credit file.

6. NAV BUSINESS. RESOLVED, that the officers are authorized to open and manage a Nav (Nav Technologies) business account to monitor and build the Corporation's business credit and to access financing options.

7. AUTHORITY & PERSONAL GUARANTY. RESOLVED, that the officers may complete applications and agreements for the foregoing and provide the Corporation's information to these institutions. [If any issuer requires a personal guaranty, no director is obligated to provide one except as separately agreed in writing.]

8. RELIANCE & RATIFICATION. RESOLVED, that any institution may rely on a Secretary-certified copy of these resolutions until it receives written notice of revocation; and that prior related acts of the officers are ratified.

This consent may be signed in counterparts. By signing below, each director votes for and adopts the foregoing resolutions.

[EACH DIRECTOR SIGNS]   Date: [____]

CERTIFICATE OF SECRETARY
I certify that I am the Secretary of Adams Infinite Legacy and that the foregoing resolutions were duly adopted by its Board of Directors and remain in full force and effect.
Secretary: ______________________   Date: [____]

[Fill in the bracketed institution and officer details; some issuers require their own resolution or forms as well.]`,

  propcontribution: `RESOLUTION
MINUTES
Corporation ID: [CORPORATION ID]

ADAMS INFINITE LEGACY — A [STATE] Corporation (foreign-qualified in [FOREIGN STATE])
EIN: [EIN]

Date of meeting and of this resolution: October 14, 2026

MEETING DETAILS
A meeting of the Board of Directors of Adams Infinite Legacy (the "Corporation") was duly called and held on Wednesday, October 14, 2026, at 10:00 a.m., at [ADDRESS], [CITY], [FOREIGN STATE] (or by video/teleconference). A quorum being present, the meeting was called to order.

DIRECTORS PRESENT
All directors of the Corporation were present, in person or by teleconference, constituting a quorum.
Directors absent: None.
Also present: None.

STATEMENT OF PURPOSE
The Board determined that it is in the best interest of the Corporation to consider and act upon the following matter: whether to accept the contribution to the Corporation of certain inherited real property located in Pointe Coupee Parish, Louisiana.
Background: Charles Edward Pleasant, Jr. (the "Contributor") acquired an undivided interest in the five parcels described below as the sole heir of Ann Marie St. Amant Pleasant (died December 13, 2023, Pointe Coupee Parish, Louisiana), whose interest is being recognized in the Contributor by a small succession affidavit under La. C.C.P. arts. 3431–3434 to be recorded in the conveyance records of Pointe Coupee Parish. The Contributor wishes to contribute that undivided interest to the Corporation.

PROPERTY TO BE CONTRIBUTED
All of the Contributor's undivided interest, together with all buildings and improvements, in the following parcels situated in Pointe Coupee Parish, Louisiana (2025 assessor market values shown for each whole parcel):
  Parcel 00797700 — Two lots each fronting 48 ft. on St. Mary Street; CB 117, E-254 — $14,000
  Parcel 00797800 — Part of Lot 26, 807 Richey Street, New Roads, LA; CB 117, E-254; CB 454, E-8 — $33,700
  Parcel 00797900 — Lot 36 ft. on the east side of Richey Street; CB "V", E-407; CB 117, E-254; CB 454, E-8 — $4,600
  Parcel 00798000 — Lot on the west side of St. Mary Street, 905 St. Mary Street, New Roads, LA; CB 117, E-254 — $56,200
  Parcel 00798010 — Lot 17, Square 7, Second Addition, Morningside Subdivision; CB 117, E-254; CB 348, E-35 — $8,000
The contribution is of the Contributor's undivided (fractional) interest only; the Corporation will hold such interest as a co-owner with the other owners of record.

RESOLUTION
Upon motion duly made, seconded, and after discussion, it was:
RESOLVED, that the Corporation accept the contribution of the Contributor's undivided interest in the parcels described above as a contribution to the capital of the Corporation; and further
RESOLVED, that the officers of the Corporation are authorized and directed to accept, negotiate, execute, and deliver, and to cause to be recorded in Pointe Coupee Parish, Louisiana, an act of contribution, donation, or cash-sale deed and any related instruments conveying that interest to the Corporation, on terms the officers approve; and further
RESOLVED, that the officers record the contribution on the Corporation's books, issue any consideration or capital credit the officers determine, and take all further actions reasonably necessary to carry out these resolutions.

VOTE (majority rules — the resolution passes only if the Ayes are a majority of the directors present)
Votes in favor (Ayes): all directors present        Votes against (Noes): 0        Abstentions: 0
Result:   [X] ADOPTED        [ ] REJECTED

There being no further business, the meeting was adjourned at 10:30 a.m.

SIGNATURES
The undersigned certify that the foregoing accurately records the action taken by the Board of Directors of the Corporation.
Each director signs below.   Date: October 14, 2026
Secretary: ______________________   Date: October 14, 2026

NOTARY ACKNOWLEDGMENT (optional)
State of [FOREIGN STATE]     County of [COUNTY]
Subscribed and sworn to before me this [__] day of [MONTH], [YEAR].
Notary Public: ______________________     My commission expires: [____]`,

  propcontribdeed: `ACT OF CONTRIBUTION OF IMMOVABLE PROPERTY
(Contribution to the Capital of a Wholly-Owned Corporation — Act Under Private Signature)
Corporation ID: [CORPORATION ID]

STATE OF [FOREIGN STATE]
PARISH/COUNTY OF ______________________

BE IT KNOWN, that on the date set forth below, the undersigned:

CHARLES EDWARD PLEASANT, JR., a competent major residing at 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031 ("Contributor"),

who declared that, for the consideration stated below, he does by these presents CONTRIBUTE, TRANSFER, ASSIGN, SET OVER, and DELIVER, with full substitution and subrogation to all rights and actions of warranty he holds, but otherwise WITHOUT WARRANTY of title and without recourse, even for the return of the consideration, unto:

ADAMS INFINITE LEGACY, a [STATE] corporation foreign-qualified in [FOREIGN STATE], EIN [EIN], whose address is [ADDRESS], [CITY], [FOREIGN STATE] ("the Corporation"),

which, through its undersigned officer, accepts for the Corporation, its successors and assigns, the following described immovable property, together with all buildings, improvements, rights, ways, and appurtenances thereto belonging.

ORIGIN OF TITLE
Contributor acquired the interest conveyed herein as the sole heir of Ann Marie St. Amant Pleasant (died December 13, 2023, Pointe Coupee Parish, Louisiana), whose succession was opened and whose heir was recognized by Affidavit of Small Succession under La. C.C.P. arts. 3431–3434, recorded October 20, 2026 in the conveyance records of Pointe Coupee Parish, Louisiana, at Conveyance Book (COB) 9898, Page 1. The Decedent acquired her interest by act recorded in Conveyance Book 117, Entry 254 of said records.

PROPERTY
All of Contributor's undivided interest, together with all buildings and improvements, in the following parcels situated in Pointe Coupee Parish, Louisiana:
  Parcel 00797700 — Two lots each fronting 48 ft. on St. Mary Street; bounded north and east by A. Fabre, south by J. Roberts; CB 117, E-254.
  Parcel 00797800 — Part of Lot 26, 92 x 96 ft., east side of Richey Street, less a 36' x 46' lot in the northeast corner (lot fronts 56' on Richey Street); bounded north by T. Jeffrion, west by Nelson, south by O. Desormes; CB 117, E-254; CB 454, E-8. Municipal address 807 Richey Street, New Roads, LA.
  Parcel 00797900 — Lot 36 ft. on the east side of Richey Street; bounded north by O. Fabre, west by W. St. Amant; CB "V", E-407; CB 117, E-254; CB 454, E-8.
  Parcel 00798000 — Lot fronting the west side of St. Mary Street, 56 x 85 ft.; bounded north by M. Labbe, south by C. Hollins; CB 117, E-254. Municipal address 905 St. Mary Street, New Roads, LA.
  Parcel 00798010 — Lot 17, Square 7, Second Addition, Morningside Subdivision, Section 35, Township 4, Range 10; CB 117, E-254; CB 348, E-35.

The interest conveyed is Contributor's undivided (fractional) interest only. The Corporation takes title as a co-owner in indivision with the other owners of record and acknowledges that this act conveys no greater interest than Contributor owns.

CONSIDERATION
This contribution is made as a contribution to the capital of the Corporation. Contributor is the sole shareholder of the Corporation; accordingly, no new shares are issued, and the value of the contributed property is credited to the Corporation's additional paid-in capital. The parties agree this is a non-cash contribution to capital and not a sale for a cash price.

TAXES & POSSESSION
Ad valorem taxes for the current year shall be prorated to the date of this act. Possession is delivered as of the date hereof. The parties waive production of mortgage and conveyance certificates.

ACCEPTANCE
The Corporation, through its undersigned officer, accepts this contribution and the property described above on the terms stated herein.

This Act of Contribution is executed by the parties as an act under private signature, intended to be recorded in the conveyance records of Pointe Coupee Parish, Louisiana upon acknowledgment as provided below.

____________________________________          Date: ______________, 20____
Charles Edward Pleasant, Jr., Contributor

ADAMS INFINITE LEGACY
By: ________________________________          Date: ______________, 20____
Name/Title: ________________________, Authorized Officer

ACKNOWLEDGMENT
STATE OF [FOREIGN STATE]
PARISH/COUNTY OF ______________________

On this ______ day of ____________________, 20____, before me, the undersigned Notary Public, personally appeared Charles Edward Pleasant, Jr., and the above-named authorized officer of Adams Infinite Legacy, each to me known (or satisfactorily proven) to be the persons who executed the foregoing Act of Contribution, who each acknowledged to me that they signed and executed the same as their free act and deed, and the officer that he/she did so on behalf of and with the authority of the Corporation.

____________________________________
Notary Public
Printed name: ______________________     Notary ID / Bar No.: ______________
My commission expires: ______________`,

  est_will: `LAST WILL AND TESTAMENT
of Charles Edward Pleasant, Jr.

I, CHARLES EDWARD PLEASANT, JR., born October 21, 1973, domiciled at 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031, being of sound mind and acting freely, declare this to be my Last Will and Testament. I revoke all wills and codicils I have previously made.

ARTICLE I — MY FAMILY
I am married to JUDY ANN ADAMS ("my spouse"). I have one child, ALITALIA ADAMS, born March 25, 1992. "My children" means Alitalia Adams and any child later born to or adopted by me; "descendants" includes descendants of every degree, by blood or adoption.

ARTICLE II — DEBTS, EXPENSES, AND TAXES
My Executor shall pay my legally enforceable debts, funeral expenses, and the expenses of administering my estate from the residue of my estate. Estate, inheritance, and similar taxes on property passing under this Will or under my Revocable Living Trust shall be paid from the residue of the trust estate without apportionment, except that taxes attributable to property passing outside this Will and the Trust (such as retirement accounts or insurance payable to a named beneficiary) shall be borne by the recipients of that property. No debt secured by real property need be prepaid.

ARTICLE III — TANGIBLE PERSONAL PROPERTY
3.1 I give all of my tangible personal property — household furnishings, vehicles, jewelry, clothing, books, electronics, and personal effects, with any insurance on them — to my spouse, if she survives me. If she does not survive me, I give that property to my children who survive me in shares of substantially equal value as they agree, or as my Executor determines if they do not agree within 90 days.
3.2 I may leave a written memorandum, signed by me, disposing of items of tangible personal property, as permitted by Va. Code § 64.2-400. If one exists at my death it shall be given effect as part of this Will and controls over this Article for the items it lists.

ARTICLE IV — RESIDUE: GIFT TO MY REVOCABLE LIVING TRUST
4.1 I give the residue of my estate — all property I own at my death not otherwise effectively disposed of, including lapsed gifts — to the trustee then serving under the CHARLES EDWARD PLEASANT, JR. REVOCABLE LIVING TRUST, established by me as grantor under a trust agreement signed on or about the date of this Will, as amended before my death, to be added to the trust estate and held, administered, and distributed under that trust agreement. This gift is made under Va. Code § 64.2-425 and is valid even though the trust is amendable and revocable and even if amended after this Will is signed.
4.2 If for any reason that gift cannot take effect, I give the residue of my estate to my spouse, if she survives me, and if she does not, to my descendants who survive me, per stirpes; any share for a descendant under age 25 shall be held by my Executor as trustee on the terms the Trust provides for such a beneficiary.

ARTICLE V — BUSINESS INTERESTS
My interests in Adams Infinite Legacy, Paragon Government Solutions LLC, Paragon WebStudio, DebtDefense, and any other business I own are intended to be held in my Revocable Living Trust and governed by the Trust and by the Business Succession and Buy-Sell Plan. To the extent any business interest is nonetheless part of my probate estate, my Executor may continue, operate, vote, sell, or wind up that business without court order, may rely on the Succession Plan, and shall not be liable for losses from continuing a business in good faith.

ARTICLE VI — EXECUTOR
6.1 I appoint my spouse, JUDY ANN ADAMS, as Executor. If she fails or ceases to serve, I appoint my child, ALITALIA ADAMS, as successor Executor.
6.2 No Executor shall be required to give bond or surety, to file an inventory or accountings with any court or commissioner of accounts except as required by law and not waivable, or to obtain court approval for any act. I request that my estate be administered with the least court supervision Virginia law permits.
6.3 In addition to all powers given by Virginia law, including Va. Code § 64.2-105, my Executor may without court order: retain, sell, lease, or exchange any property; settle claims; make tax elections; distribute in cash or in kind; employ and pay advisers; access and manage my digital assets and electronic communications (Va. Code § 64.2-116 et seq.); and act on my behalf as shareholder, member, director, or officer of any entity.

ARTICLE VII — GUARDIAN
If at my death I have a child under 18 whose other parent does not survive me, I appoint ALITALIA ADAMS as guardian of the person and property of that child, to serve without bond.

ARTICLE VIII — GENERAL PROVISIONS
8.1 Survivorship. A beneficiary must survive me by 30 days to be treated as surviving me.
8.2 Simultaneous death. If my spouse and I die under circumstances in which the order of death cannot be established, I shall be deemed to have survived her for purposes of this Will.
8.3 Spendthrift. No interest of any beneficiary shall be subject to anticipation, assignment, or the claims of creditors before actual receipt.
8.4 Governing law. This Will shall be construed under the laws of the Commonwealth of Virginia.

IN WITNESS WHEREOF, I have signed this Will, consisting of this and the preceding pages, each of which I have initialed, on ____________________, 20____, at ____________________, Virginia.

Testator: ______________________   Charles Edward Pleasant, Jr.

ATTESTATION (Va. Code § 64.2-403 — two competent witnesses, present at the same time)
The foregoing instrument was, on the date above, signed and declared by Charles Edward Pleasant, Jr. to be his Last Will and Testament in our presence, and we, at his request and in his presence and in the presence of each other, have signed our names as witnesses. Each of us is over 18 and is not a beneficiary under this Will.
Witness 1: ______________________   Printed: ______________________   Address: ______________________
Witness 2: ______________________   Printed: ______________________   Address: ______________________

SELF-PROVING AFFIDAVIT (Va. Code § 64.2-452)
Commonwealth of Virginia, City/County of ____________________, to wit:
Before me, the undersigned authority, on this day personally appeared Charles Edward Pleasant, Jr., ______________________, and ______________________, known to me to be the testator and the witnesses whose names are signed to the foregoing instrument, and, all being first duly sworn, the testator declared to me and to the witnesses in my presence that the instrument is his last will and testament and that he willingly signed it and executed it in the presence of the witnesses as his free and voluntary act for the purposes therein expressed; and the witnesses stated before me that the will was executed and acknowledged by the testator as his last will and testament in their presence and that they, in his presence and at his request and in the presence of each other, subscribed their names as attesting witnesses on the day of the date of the will, and that the testator was then over eighteen years of age and of sound and disposing mind and memory.
Testator: ______________________     Witness: ______________________     Witness: ______________________
Subscribed, sworn to, and acknowledged before me by the testator and subscribed and sworn to before me by the witnesses this ______ day of ____________________, 20____.
Notary Public: ______________________   Registration No.: __________   My commission expires: __________`,

  est_trust: `REVOCABLE LIVING TRUST AGREEMENT
The Charles Edward Pleasant, Jr. Revocable Living Trust — Virginia Uniform Trust Code, Va. Code § 64.2-700 et seq.

ARTICLE I — CREATION OF TRUST
1.1 Parties. This Trust Agreement is made on ____________________, 20____, by CHARLES EDWARD PLEASANT, JR., of 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031, as Grantor, and CHARLES EDWARD PLEASANT, JR. as initial Trustee.
1.2 Name. The trust shall be known as the Charles Edward Pleasant, Jr. Revocable Living Trust. Assets may be titled: "Charles Edward Pleasant, Jr., Trustee of the Charles Edward Pleasant, Jr. Revocable Living Trust dated ____________, 20____."
1.3 Family. Grantor is married to JUDY ANN ADAMS ("Spouse"). Grantor has one child, ALITALIA ADAMS, born March 25, 1992. "Children" includes any child later born to or adopted by Grantor.
1.4 Funding. Grantor transfers to the Trustee the property on Schedule A and may add property at any time by assignment, deed, beneficiary designation, or Will. The Trustee accepts and agrees to hold all such property (the "trust estate") on the terms below.
1.5 Revocability. During Grantor's lifetime this trust is revocable and amendable by Grantor, in whole or part, by a signed writing delivered to the Trustee. Grantor's Agent under a durable power of attorney may amend or revoke only if that power expressly authorizes it. On Grantor's death the trust becomes irrevocable.
1.6 Tax status. During Grantor's life the trust is a grantor trust; its income is reported under Grantor's Social Security number and no separate return is required.

ARTICLE II — DURING GRANTOR'S LIFETIME
2.1 Distributions. The Trustee shall pay to or for Grantor as much of the income and principal as Grantor directs, and otherwise as the Trustee considers advisable for the health, support, and comfort of Grantor and Grantor's Spouse and dependents in their accustomed manner of living.
2.2 Incapacity. If Grantor becomes incapacitated — as certified in writing by two licensed physicians, or by one physician with the written concurrence of the successor Trustee, or as determined by a court — the successor Trustee shall serve, shall continue distributions under 2.1, may pay Grantor's obligations and insurance premiums, may fund the trust from Grantor's other assets through the Agent under Grantor's power of attorney, and shall operate Grantor's business interests under Article V. Grantor resumes as Trustee on a physician's written certification of restored capacity.

ARTICLE III — AT GRANTOR'S DEATH
3.1 Expenses and taxes. The Trustee may pay Grantor's funeral expenses, legally enforceable debts, expenses of administration, and all death taxes on property passing under this trust or Grantor's Will, to the extent Grantor's probate estate is insufficient or the Executor requests, without apportionment except as provided in Grantor's Will.
3.2 Tangible personal property passes as provided in Article III of Grantor's Will and any memorandum under Va. Code § 64.2-400.
3.3 Residue to Spouse. If Spouse survives Grantor by 30 days, the Trustee shall distribute the remaining trust estate to Spouse, outright and free of trust. Spouse may disclaim all or part of this gift; disclaimed property passes under 3.4 as if Spouse had not survived.
3.4 Residue to Children. If Spouse does not survive Grantor (or as to disclaimed property), the Trustee shall divide the remaining trust estate into equal shares for Grantor's children who survive Grantor and for the then-living descendants, collectively, of any child who does not survive, per stirpes, and distribute each share outright — except that a share for a beneficiary under age 25 shall be held under Article IV.
3.5 Ultimate takers. If no Spouse or descendant survives, the trust estate passes one-half to Grantor's heirs at law and one-half to Spouse's heirs at law, determined under Virginia law.

ARTICLE IV — TRUST FOR A YOUNG BENEFICIARY
Property held for a beneficiary under age 25 shall be held in a separate trust. The Trustee shall distribute as much income and principal as is advisable for the beneficiary's health, education (including post-secondary and vocational), maintenance, and support, considering other resources, and shall distribute the balance outright at age 25 or earlier in the Trustee's discretion. If the beneficiary dies before full distribution, the balance passes to the beneficiary's descendants, per stirpes, or if none, to Grantor's descendants, per stirpes.

ARTICLE V — BUSINESS INTERESTS
5.1 Authority. The Trustee is expressly authorized to retain, operate, vote, finance, recapitalize, or sell any closely held business interest in the trust — including Adams Infinite Legacy (Corporation ID [CORPORATION ID]), Paragon Government Solutions LLC, Paragon WebStudio, and DebtDefense — for as long as the Trustee considers advisable, free of any duty to diversify, and shall not be liable for losses from retaining or operating a business in good faith.
5.2 Succession plan. The Trustee shall act consistently with the Business Succession and Buy-Sell Plan, including voting the shares to confirm the Interim CEO, honoring any purchase option at the price and terms there stated, and cooperating with novation or SAM.gov updates only if actually required.
5.3 Officers and conflicts. A Trustee who is also an officer, director, member, or employee of a business in the trust may act in both capacities, may receive reasonable compensation in each, and is not disqualified by that dual role.
5.4 Limited liability entities. The Trustee may accept assignments of LLC membership interests, sign operating-agreement joinders, and serve as or appoint managers.

ARTICLE VI — REAL PROPERTY
The Trustee may hold, lease, improve, partition, or sell any real property, including undivided interests in co-owned (heirs') property in Pointe Coupee Parish, Louisiana (Parcels 00797700, 00797800, 00797900, 00798000, 00798010; chain of title at Conveyance Book 9898). The Trustee shall keep property taxes current, may advance the trust's share of taxes and upkeep and seek contribution from co-owners, may exercise rights under the Louisiana Uniform Partition of Heirs Property Act, and may acquire co-owners' interests. Louisiana immovable property is governed by Louisiana law as to title and transfer.

ARTICLE VII — TRUSTEE SUCCESSION AND ADMINISTRATION
7.1 Successor Trustees. If Grantor ceases to serve as Trustee for any reason, JUDY ANN ADAMS shall serve as successor Trustee; if she fails or ceases to serve, ALITALIA ADAMS shall serve. A serving Trustee may name additional or successor Trustees in writing. If no named Trustee can serve, a majority of the adult income beneficiaries may appoint a successor.
7.2 Bond; court; accounting. No Trustee shall be required to post bond, to qualify before or account to any court, or to obtain court approval for any act. The Trustee shall provide annual reports to current beneficiaries as required by Va. Code § 64.2-775.
7.3 Compensation; resignation; liability. A Trustee is entitled to reasonable compensation and reimbursement of expenses, may resign on 30 days' written notice to the beneficiaries, and is liable only for willful misconduct or gross negligence. A successor Trustee need not audit a predecessor.
7.4 Powers. The Trustee has all powers in Va. Code § 64.2-778 and the Virginia Uniform Trust Code and may in addition: hold property in nominee name; borrow and encumber; make tax elections and allocations between income and principal; divide or merge trusts; distribute in cash or in kind, non-pro-rata; employ and pay advisers; and access and manage digital assets and electronic communications (Va. Code § 64.2-116 et seq.).

ARTICLE VIII — GENERAL PROVISIONS
8.1 Spendthrift. No beneficiary may assign or anticipate any interest, and no interest is subject to a beneficiary's creditors, before actual distribution (Va. Code § 64.2-743).
8.2 Survivorship. A beneficiary must survive by 30 days to take. Grantor is deemed to survive Spouse in a common disaster.
8.3 Perpetuities. Every trust hereunder shall terminate no later than the maximum period permitted by Va. Code § 55.1-124 et seq., and the property shall then vest in the current income beneficiaries.
8.4 Definitions. "Per stirpes" means by representation under Va. Code § 64.2-202. "Incapacity" is defined in 2.2.
8.5 Governing law. Virginia law governs the validity, construction, and administration of this trust. The Trustee may transfer the situs of administration.
8.6 Certification. Third parties may rely on a Certification of Trust under Va. Code § 64.2-804 instead of this Agreement.

Grantor: ______________________   Charles Edward Pleasant, Jr.
Trustee: ______________________   Charles Edward Pleasant, Jr.
Consent of Spouse: ______________________   Judy Ann Adams

ACKNOWLEDGMENT
Commonwealth of Virginia, City/County of ____________________, to wit: The foregoing Trust Agreement was acknowledged before me on ____________________, 20____, by Charles Edward Pleasant, Jr., as Grantor and as Trustee, and by Judy Ann Adams.
Notary Public: ______________________   Registration No.: __________   My commission expires: __________

SCHEDULE A — INITIAL TRUST PROPERTY
1. 100% of the shares of Adams Infinite Legacy (Corporation ID [CORPORATION ID]) — by the Assignment of Shares to the Trust; stock ledger updated.
2. Membership interest in Paragon Government Solutions LLC — ____% (state of formation: ______) — by assignment of membership interest and operating-agreement joinder.
3. Paragon WebStudio — entity type: ______; ____% — by assignment (or DBA registration updated).
4. DebtDefense — entity type: ______; ____% — by assignment (or DBA registration updated).
5. Personal bank and brokerage accounts — retitled to the Trustee or with the Trust named as POD/TOD beneficiary (see the Beneficiary Forms plan).
6. Tangible personal property and household effects — by this Schedule (general assignment).
7. Any personal interest retained in the Pointe Coupee Parish, Louisiana parcels — by Louisiana act of transfer recorded in Pointe Coupee Parish (only if not already conveyed to the Corporation).
8. Ten dollars ($10.00) cash — delivered on signing.

CERTIFICATION OF TRUST (Va. Code § 64.2-804 — give this page to banks and title companies instead of the full Agreement)
1. The Charles Edward Pleasant, Jr. Revocable Living Trust exists and was signed on ____________________, 20____.
2. The Grantor is Charles Edward Pleasant, Jr. The currently acting Trustee is ______________________, 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031.
3. The Trustee has full power to acquire, sell, encumber, and manage trust property, to open and operate accounts, and to vote and transfer business interests.
4. The trust is revocable by the Grantor during his lifetime; no other person holds a power to revoke.
5. Title to trust property is taken as: "______________________, Trustee of the Charles Edward Pleasant, Jr. Revocable Living Trust dated ____________, 20____." Trust TIN: Grantor's SSN during his life; EIN ______________ thereafter.
6. The trust has not been revoked, modified, or amended in any manner that would make these representations incorrect.
Trustee: ______________________   Date: __________
Sworn to and acknowledged before me on ____________________, 20____.   Notary Public: ______________________   Registration No.: __________   My commission expires: __________`,

  est_shareassign: `ASSIGNMENT OF SHARES TO REVOCABLE TRUST
Adams Infinite Legacy — a [STATE] corporation (Corporation ID [CORPORATION ID]), foreign-qualified in [FOREIGN STATE]

1. PARTIES
Assignor: CHARLES EDWARD PLEASANT, JR., an individual residing at 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031.
Assignee: CHARLES EDWARD PLEASANT, JR., as Trustee of the CHARLES EDWARD PLEASANT, JR. REVOCABLE LIVING TRUST dated ____________________, 20____, and any successor trustee (the "Trust" or "Trustee").
Corporation: Adams Infinite Legacy, EIN [EIN], principal office [ADDRESS], [CITY], [FOREIGN STATE] (the "Corporation").

2. ASSIGNMENT
For estate-planning purposes and for no monetary consideration, Assignor assigns, transfers, and conveys to the Trustee, to hold as part of the Trust estate, all of the shares of capital stock of the Corporation owned by Assignor — being one hundred percent (100%) of the issued and outstanding shares, consisting of ____________ shares of common stock, certificate no(s). ____________ (or uncertificated, as reflected on the stock ledger) (the "Shares") — with all rights, dividends, distributions, and voting rights pertaining to them. Assignor retains, as Trustee and as settlor of a revocable trust, full control of the Shares during his lifetime. This assignment does not change who manages the Corporation, does not change the Corporation's ownership for tax purposes (the Trust is a grantor trust), and is not a change of control.

3. COMPLIANCE WITH SHAREHOLDERS' AGREEMENT
This transfer is a Permitted Transfer under Section 2.3 of the Shareholders' Agreement, which allows a shareholder to transfer shares to a trust for estate-planning purposes if the transferee first agrees in writing to be bound by that Agreement. By signing the Joinder below, the Trustee so agrees. Because Assignor is the sole shareholder, no right of first refusal, tag-along, or drag-along right is triggered.

4. GOVERNMENT CONTRACTS
The Corporation remains the same legal entity, contractor, and party to all of its contracts. A transfer of shares to the shareholder's revocable trust is not an asset transfer and does not require novation under FAR Subpart 42.12. The Corporation shall update its SAM.gov registration and ownership representations only if and when required.

5. CORPORATE RECORDS; FURTHER ASSURANCES
The Corporation is directed to record this transfer on its stock ledger, to cancel any certificate in Assignor's individual name, and to issue a new certificate (or ledger entry) in the name of the Trustee. Assignor appoints the Secretary of the Corporation as attorney-in-fact to make the transfer on the Corporation's books. Each party shall sign any further instruments reasonably required to carry out this assignment.

6. GOVERNING LAW
This assignment is governed by the laws of [STATE] as to the internal affairs of the Corporation and otherwise by the laws of [FOREIGN STATE].

Assignor: ______________________   Charles Edward Pleasant, Jr., individually   Date: __________

ACCEPTANCE AND JOINDER BY TRUSTEE
The undersigned Trustee accepts the Shares into the Trust and agrees to be bound by the Shareholders' Agreement of the Corporation.
Trustee: ______________________   Charles Edward Pleasant, Jr., Trustee   Date: __________

ACKNOWLEDGMENT BY THE CORPORATION
The Corporation acknowledges this assignment and has recorded the transfer on its stock ledger.
Secretary: ______________________   Alitalia Adams, Secretary   Date: __________

NOTARIAL ACKNOWLEDGMENT
Commonwealth of Virginia, City/County of ____________________, to wit: The foregoing instrument was acknowledged before me on ____________________, 20____, by Charles Edward Pleasant, Jr., individually and as Trustee.
Notary Public: ______________________   Registration No.: __________   My commission expires: __________`,

  est_poa: `DURABLE GENERAL POWER OF ATTORNEY
Made under the Virginia Uniform Power of Attorney Act, Va. Code § 64.2-1600 et seq.

1. PRINCIPAL AND AGENTS
I, CHARLES EDWARD PLEASANT, JR., of 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031 (the "Principal"), appoint JUDY ANN ADAMS as my Agent (attorney-in-fact). If Judy Ann Adams is unable or unwilling to serve, or ceases to serve for any reason, I appoint ALITALIA ADAMS as my Successor Agent, with all the same powers.

2. DURABILITY AND EFFECTIVE DATE
This power of attorney is durable: it is not affected by my subsequent incapacity (Va. Code § 64.2-1602). It is effective immediately upon signing and continues until my death or until I revoke it in writing.
[____] Initial here only if you prefer this power to take effect upon your incapacity, as certified in writing by your attending physician (a "springing" power).

3. GENERAL GRANT OF AUTHORITY
I grant my Agent general authority to act for me with respect to all of the following subjects, as defined in Va. Code §§ 64.2-1625 through 64.2-1637: real property; tangible personal property; stocks and bonds; commodities and options; banks and other financial institutions; operation of an entity or business; insurance and annuities; estates, trusts, and other beneficial interests; claims and litigation; personal and family maintenance; benefits from governmental programs or civil or military service; retirement plans; and taxes.

4. BUSINESS AND GOVERNMENT-CONTRACTING AUTHORITY
Without limiting the foregoing, my Agent may, on my behalf and as my proxy as shareholder, director, and officer: vote the shares of and exercise all of my rights in Adams Infinite Legacy (Corporation ID [CORPORATION ID]) and any other entity I own or control; sign board consents and resolutions; execute, administer, and perform government and commercial contracts, including SAM.gov, CAGE, and contracting-officer correspondence; operate bank accounts, lines of credit, and merchant accounts; hire, direct, and pay personnel; and continue, sell, or wind up any business as my Agent judges best, consistent with any business succession plan I have signed.

5. SPECIFIC AUTHORITY (requires express grant — Va. Code § 64.2-1622)
I grant my Agent the following specific powers only where I have initialed:
[____] Create, amend, revoke, or terminate an inter vivos trust, including funding my revocable living trust.
[____] Make gifts, limited to the federal annual-exclusion amount per recipient per year and gifts consistent with my estate plan.
[____] Create or change rights of survivorship, and create or change a beneficiary designation.
[____] Delegate authority granted under this power of attorney.
[____] Waive my right to be a beneficiary of a joint and survivor annuity, including a survivor benefit under a retirement plan.
[____] Exercise fiduciary powers that I have authority to delegate.
[____] Disclaim property, including a power of appointment.
[____] Access the content of my electronic communications and manage my digital assets (Va. Code § 64.2-116 et seq.).

6. AGENT'S DUTIES; COMPENSATION; RELIANCE
My Agent shall act in good faith, within the scope of this authority, in my best interest, and shall keep records of all transactions (Va. Code § 64.2-1612). My Agent is entitled to reimbursement of reasonable expenses and to reasonable compensation. Any third party may rely on this instrument and my Agent's signature without further inquiry; a third party that refuses to accept this acknowledged power of attorney without a reason permitted by Va. Code § 64.2-1618 may be liable for attorney's fees and costs.

7. NOMINATION OF GUARDIAN OR CONSERVATOR
If a court later appoints a conservator of my estate or guardian of my person, I nominate my Agent then serving under this instrument.

8. REVOCATION OF PRIOR POWERS
I revoke all prior general powers of attorney, except powers given on forms of financial institutions for specific accounts and any health-care power of attorney.

Principal: ______________________   Charles Edward Pleasant, Jr.   Date: __________

ACKNOWLEDGMENT (required for real-estate transactions; makes the signature presumed genuine, Va. Code § 64.2-1603)
Commonwealth of Virginia, City/County of ____________________, to wit: The foregoing Durable General Power of Attorney was acknowledged before me on ____________________, 20____, by Charles Edward Pleasant, Jr., who is personally known to me or produced satisfactory identification.
Notary Public: ______________________   Registration No.: __________   My commission expires: __________

AGENT'S ACCEPTANCE (optional but recommended)
By signing below, each Agent acknowledges the duties in Va. Code § 64.2-1612 and accepts appointment.
Agent: ______________________   Judy Ann Adams   Date: __________
Successor Agent: ______________________   Alitalia Adams   Date: __________

AGENT'S CERTIFICATION (for third parties, Va. Code § 64.2-1619)
I, ______________________, certify that I am the Agent named in the Durable General Power of Attorney executed by Charles Edward Pleasant, Jr. on ____________; that to my knowledge the Principal is alive and the power has not been revoked, suspended, or terminated; and that I am acting within the scope of my authority.
Agent: ______________________   Date: __________`,

  est_amd: `ADVANCE MEDICAL DIRECTIVE
Appointment of Health Care Agent and Health Care Instructions — Virginia Health Care Decisions Act, Va. Code § 54.1-2981 et seq.

I, CHARLES EDWARD PLEASANT, JR., born October 21, 1973, of 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031, being of sound mind, willfully and voluntarily make this Advance Medical Directive.

PART I — APPOINTMENT OF HEALTH CARE AGENT
1.1 I appoint JUDY ANN ADAMS as my Agent to make health care decisions for me if I am determined to be incapable of making an informed decision, as provided in Va. Code § 54.1-2983.2. If she is unable or unwilling to act, I appoint ALITALIA ADAMS as my Successor Agent. Agent phone: ________________. Successor phone: ________________.
1.2 My Agent may: consent to, refuse, or withdraw any treatment, including life-prolonging procedures; select and discharge providers and facilities, including admission to a hospital, hospice, nursing home, or assisted-living facility; authorize release of my medical records and act as my personal representative under HIPAA (45 C.F.R. § 164.502(g)); make anatomical gifts and decisions about autopsy and disposition of remains; and take any other action I could take about my health care. My Agent shall act according to my known wishes and, where unknown, in my best interest.
1.3 [____] Initial if you also authorize your Agent to consent to your admission to a facility for mental-health treatment and to psychiatric medication under Va. Code § 54.1-2986.2.

PART II — HEALTH CARE INSTRUCTIONS (LIVING WILL)
If my attending physician determines that I have a terminal condition where life-prolonging procedures would serve only to artificially prolong the dying process, or that I am in a persistent vegetative state or otherwise permanently unconscious, I direct (initial one):
[____] that life-prolonging procedures be withheld or withdrawn, and that I be permitted to die naturally with only the medication and procedures necessary to keep me comfortable and relieve pain; or
[____] that all medically appropriate life-prolonging procedures be provided; or
[____] that my Agent decide, after consulting my physicians.
Artificially administered nutrition and hydration: [____] withhold or withdraw as above   [____] always provide.
Other instructions (religious, organ donation, specific treatments): ______________________________________________

PART III — ANATOMICAL GIFTS
[____] I donate any needed organs and tissues.   [____] I donate only: ______________________.   [____] I do not wish to donate.

PART IV — GENERAL PROVISIONS
This directive shall be honored by my family, physicians, and providers as the final expression of my legal right to refuse or accept medical treatment. It revokes any prior advance directive or health care power of attorney. A copy has the same effect as the original. I may revoke this directive at any time by a signed writing, by physical destruction, or by an oral expression of intent to revoke (Va. Code § 54.1-2985).

Declarant: ______________________   Charles Edward Pleasant, Jr.   Date: __________

WITNESSES (Virginia requires two adult witnesses who sign in the declarant's presence; a witness may not be the appointed Agent. Notarization is not required.)
The declarant signed this Advance Medical Directive in my presence, is personally known to me, and appeared to be of sound mind and free of duress.
Witness 1: ______________________   Printed: ______________________   Date: __________
Witness 2: ______________________   Printed: ______________________   Date: __________

Copies kept: estate binder; Agent; Successor Agent; primary physician: ______________________. The directive may also be registered with the Virginia Advance Health Care Directive Registry (connectvirginia.org).`,

  est_digital: `DIGITAL ASSETS AUTHORIZATION
Consent to fiduciary access under the Virginia Uniform Fiduciary Access to Digital Assets Act, Va. Code § 64.2-116 et seq.

1. DECLARANT AND DESIGNATED FIDUCIARIES
I, CHARLES EDWARD PLEASANT, JR., of 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031, make this authorization. It applies to each of the following when acting for me (each, a "Fiduciary"): my Agent under my Durable General Power of Attorney; the Executor of my estate; the Trustee of the Charles Edward Pleasant, Jr. Revocable Living Trust; and any court-appointed guardian or conservator — presently JUDY ANN ADAMS, and if she cannot serve, ALITALIA ADAMS.

2. CONSENT TO DISCLOSURE
I expressly consent, under Va. Code §§ 64.2-119 through 64.2-124, to the disclosure to my Fiduciary of: (a) the catalogue of my electronic communications (sender, recipient, date); (b) the content of my electronic communications, including email and messages; and (c) all of my other digital assets, including the accounts listed in Section 4. This consent overrides any contrary term of a provider's terms-of-service agreement, except an online tool I have specifically set with the provider (which controls under Va. Code § 64.2-118).

3. AUTHORITY GRANTED
My Fiduciary may access, manage, copy, transfer, download, delete, close, or continue any digital asset or account; reset passwords and change recovery information; renew, transfer, or let lapse domain names and subscriptions; collect receivables and pay obligations through online accounts; and obtain from any custodian the information needed to do so. For business accounts of Adams Infinite Legacy, my Fiduciary shall act in coordination with the Corporation's officers and succession plan.

4. INVENTORY OF DIGITAL ASSETS (credentials are not written here — they are in the password manager or sealed envelope identified in my Letter of Instruction)
4.1 Email — personal: ____________________; business: ______@forcatagroup.com. Keep active 12 months; forward to Fiduciary.
4.2 Domains and web — forcatagroup.com; others: ______________. Registrar: ______________. Renew; transfer to the Corporation's successor officer.
4.3 Governance platform — Quorum (app.quorumsuite.com): board, documents, e-signatures. Transfer admin to the Successor CEO.
4.4 Government portals — SAM.gov (Entity Administrator), login.gov, CAGE, contract portals. Entity Administrator role to successor officer.
4.5 Banking and payments — business and personal online banking; merchant processor; payroll. Fiduciary acts under the POA or Will.
4.6 Cloud and files — Google Drive / OneDrive / Dropbox: ______________. Preserve; export corporate records.
4.7 Password manager — ______________ (master credential in sealed envelope). Fiduciary access first.
4.8 Phone and two-factor — carrier: ______________; authenticator app. Device PIN in sealed envelope. Keep the number 12 months for 2FA.
4.9 Social and professional — LinkedIn; others: ______________. Memorialize or close.
4.10 Crypto and financial apps — ______________ (if any). Hardware wallet or seed in safe. Transfer to the Trust.

5. DIRECTION TO CUSTODIANS
Every custodian of my digital assets is directed to treat this instrument as my express written consent under Va. Code § 64.2-116 et seq. and to disclose and transfer my digital assets to my Fiduciary on presentation of (a) this instrument, (b) the document establishing the Fiduciary's authority (power of attorney, letters testamentary, or trust certification), and (c) any identifier the custodian reasonably requests.

Declarant: ______________________   Charles Edward Pleasant, Jr.   Date: __________

ACKNOWLEDGMENT
Commonwealth of Virginia, City/County of ____________________, to wit: The foregoing instrument was acknowledged before me on ____________________, 20____, by Charles Edward Pleasant, Jr.
Notary Public: ______________________   Registration No.: __________   My commission expires: __________`,

  est_beneficiary: `BENEFICIARY DESIGNATION PLAN
Payable-on-death, transfer-on-death, and beneficiary forms — worksheet and instructions

WHY THIS MATTERS
Accounts with a named beneficiary (POD/TOD, retirement plans, life insurance) pass directly to that person and override the Will and Trust. This plan makes every designation match the estate plan: Judy Ann Adams first, then Alitalia Adams or the Trust. Each form is filed with the institution, not with a court. Review after any marriage, divorce, birth, death, or account change.

1. TARGET DESIGNATIONS
1.1 Personal checking, savings, money market — Primary: Judy Ann Adams (100%). Contingent: Trustee, Charles Edward Pleasant, Jr. Revocable Living Trust. Ask the bank for its POD designation form, or retitle the account to the Trust.
1.2 Brokerage and investment (non-retirement) — Primary: Judy Ann Adams (100%). Contingent: Trustee of the Revocable Living Trust. Use TOD registration under the Virginia Uniform TOD Security Registration Act.
1.3 401(k), 403(b), other employer plans — Primary: Judy Ann Adams (100%). Contingent: Alitalia Adams (100%). Federal law (ERISA) requires the spouse be primary unless she signs a notarized waiver. Naming an individual, not the Trust, as contingent preserves the longest payout.
1.4 IRA, Roth IRA, SEP — Primary: Judy Ann Adams (100%). Contingent: Alitalia Adams (100%). The spouse can roll over; a child has a 10-year payout under the SECURE Act.
1.5 Life insurance (personal) — Primary: Judy Ann Adams (100%). Contingent: Trustee of the Revocable Living Trust.
1.6 Key-person or buy-sell insurance — Owned by and payable to Adams Infinite Legacy per the Succession Plan, Schedule C.
1.7 HSA — Primary: Judy Ann Adams. Contingent: Alitalia Adams. A spouse keeps it as an HSA; anyone else receives it as taxable income.
1.8 Business accounts (Adams Infinite Legacy, Paragon Government Solutions LLC, Paragon WebStudio, DebtDefense) — No POD. Accounts belong to the entity; control passes under the Succession Plan. Keep a second authorized signer on each.
1.9 Vehicles — Pass under the Will (Virginia has no vehicle TOD). Keep titles in the binder.

2. ACCOUNT INVENTORY AND STATUS (one line per account; last four digits only — full details belong in the password manager or sealed envelope)
Institution ______________   Account ending ____   Type: Checking   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______
Institution ______________   Account ending ____   Type: Savings   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______
Institution ______________   Account ending ____   Type: Brokerage   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______
Institution ______________   Account ending ____   Type: 401(k)/IRA   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______
Institution ______________   Account ending ____   Type: Life insurance   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______
Institution ______________   Account ending ____   Type: HSA   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______
Institution ______________   Account ending ____   Type: ______   Beneficiary on file: ______________   Change needed: [ ] yes [ ] no   Done: ______

3. HOW TO FILE EACH CHANGE
3.1 Log in or call the institution and ask for the beneficiary / POD / TOD designation form (many accept it online).
3.2 Name beneficiaries exactly: "Judy Ann Adams"; "Alitalia Adams"; or "Charles Edward Pleasant, Jr., Trustee of the Charles Edward Pleasant, Jr. Revocable Living Trust dated ______, 20__" (with the trust's TIN when requested).
3.3 Give each beneficiary's date of birth and relationship; percentages must total 100% at each level.
3.4 Keep the confirmation the institution sends and file it behind this page.
3.5 Record the change in the inventory above and in the Letter of Instruction.

4. BENEFICIARY DESIGNATION REQUEST (for any institution without its own form)
To: ______________________   Re: Account ending ____   Date: __________
I, Charles Edward Pleasant, Jr. (DOB 10/21/1973), owner of the above account, direct that on my death the account be paid or transferred as follows, superseding any prior designation:
Primary: Judy Ann Adams, spouse, DOB __________, 100%.
Contingent: Alitalia Adams, child, DOB 03/25/1992, 100% — or — the Trustee of the Charles Edward Pleasant, Jr. Revocable Living Trust dated __________, 100% (strike one).
Please confirm this designation in writing to 9450 Fairfax Blvd., Apt. 1339, Fairfax, Virginia 22031.
Account owner: ______________________   Charles Edward Pleasant, Jr.`,

  est_succession: `BUSINESS SUCCESSION AND BUY-SELL PLAN
Adams Infinite Legacy — a [STATE] corporation (Corporation ID [CORPORATION ID]), foreign-qualified in [FOREIGN STATE]; EIN [EIN]

1. PURPOSE AND PARTIES
This Plan states who runs Adams Infinite Legacy (the "Corporation") and how its ownership transfers if CHARLES EDWARD PLEASANT, JR. (the "Owner"), its sole shareholder and Chief Executive Officer, dies, becomes incapacitated, or otherwise ceases to lead it. It is adopted by the Owner as shareholder and by the Board of Directors, and is binding on the Corporation, the Owner, the Owner's estate and trust, and each person who signs below. It supplements the Shareholders' Agreement, the Bylaws, and the Owner's estate documents.

2. TRIGGERING EVENTS
2.1 Death of the Owner.
2.2 Incapacity — the Owner's inability to manage the Corporation's affairs for 60 consecutive days, as certified in writing by the Owner's attending physician or determined by a court.
2.3 Planned exit — the Owner's written notice of retirement or intent to sell.

3. MANAGEMENT SUCCESSION (WHO RUNS THE BUSINESS)
3.1 Interim Chief Executive Officer and President: JUDY ANN ADAMS (Vice President) — full day-to-day authority; bank signatory; contract performance; personnel.
3.2 Alternate Interim CEO: ALITALIA ADAMS (Secretary and Director) — serves if Judy Ann Adams cannot.
3.3 Secretary and corporate records: Alitalia Adams — minutes, stock ledger, filings, Quorum administration.
3.4 Board of Directors: the remaining directors; the Trustee (or the Agent under the Owner's power of attorney) votes the Owner's shares; the Board fills vacancies and ratifies interim officers within 30 days.
3.5 On a Triggering Event the Board shall, by resolution recorded in Quorum within 10 days, confirm the Interim CEO, update bank and SAM.gov authorizations, and notify contracting officers and key customers that performance continues without interruption. The Owner's shares are voted by the Trustee of the Owner's Revocable Living Trust (or, during incapacity, by the Owner's Agent under the Durable Power of Attorney).

4. OWNERSHIP SUCCESSION (HOW OWNERSHIP TRANSFERS)
4.1 Default path — Trust. The Owner's shares are held in (or pass to) the Charles Edward Pleasant, Jr. Revocable Living Trust and are administered and distributed under the Trust — to the Owner's spouse, then children — with the Trustee voting the shares in the interim. No novation of government contracts is required, because the Corporation remains the same contracting entity (FAR Subpart 42.12).
4.2 Purchase option for successor management. Within 180 days after the Owner's death or a determination of permanent incapacity, the Interim CEO and any other person named in Schedule A (each, an "Eligible Buyer") shall have the option, singly or together, to purchase all (but not less than all) of the shares from the Trust at the Purchase Price in Section 5, on the terms in Section 6. The option is exercised by written notice to the Trustee.
4.3 Sale to a third party. If no option is exercised, the Trustee may continue to hold the Corporation or sell it in the beneficiaries' best interest; any Eligible Buyer has a right of first refusal to match a bona fide third-party offer within 30 days of notice.
4.4 Planned exit. On a planned exit, the Owner and the Eligible Buyers shall negotiate in good faith for 90 days using the Purchase Price as the starting valuation.

5. PURCHASE PRICE (VALUATION)
5.1 Agreed value. The value most recently set by the Owner and Board on Schedule B (reviewed annually; a value more than 24 months old is disregarded).
5.2 Appraisal. If no current agreed value, fair market value of 100% of the shares as a going concern, determined by an independent appraiser credentialed in business valuation (ASA, ABV, or CVA) chosen by the Trustee and reasonably acceptable to the Eligible Buyer; cost shared equally. No discount for lack of marketability or minority interest, since all shares are sold.
5.3 Backlog. The appraiser shall give appropriate weight to funded government-contract backlog, option years, and recompete probability.

6. PAYMENT TERMS AND FUNDING
At the buyer's election: (a) cash at closing; or (b) at least 25% at closing and the balance by promissory note over no more than five years at the applicable federal rate plus 2%, secured by a pledge of the purchased shares, with the Corporation's distributions permitted to service the note. If the Corporation or an Eligible Buyer owns life or disability insurance on the Owner (Schedule C), the proceeds shall be applied first to the Purchase Price.

7. CONTINUITY CHECKLIST ON A TRIGGERING EVENT
7.1 Board resolution in Quorum confirming the Interim CEO and authorized signers.
7.2 Banks and merchant processor: present the resolution plus the POA or letters; update signatories.
7.3 SAM.gov: transfer the Entity Administrator role; confirm no change of entity; notify contracting officers of the new point of contact.
7.4 Payroll, benefits, insurance, leases, and registered agents ([STATE] and [FOREIGN STATE]): confirm continuity and payment.
7.5 Key customers, subcontractors, and teaming partners: continuity letter within 10 business days.
7.6 Corporate records: stock ledger updated per the Trust; [STATE] annual report and [FOREIGN STATE] foreign qualification kept current.
7.7 Louisiana real-property interests held by the Corporation (Pointe Coupee Parish parcels 00797700, 00797800, 00797900, 00798000, 00798010): taxes kept current; co-ownership rights preserved.

8. GENERAL
This Plan binds and benefits the parties, their heirs, fiduciaries, successors, and permitted assigns. It may be amended only by a writing signed by the Owner (or the Owner's Trustee after death) and approved by the Board. It is governed by [STATE] law as to corporate matters and [FOREIGN STATE] law otherwise. If any provision conflicts with the Shareholders' Agreement, the provision more protective of the Owner's beneficiaries controls.

VOTE (majority rules — the Plan is adopted only if the Ayes are a majority of the directors)
Votes in favor (Ayes): all directors present        Votes against (Noes): 0        Abstentions: 0
Result:   [X] ADOPTED        [ ] REJECTED

Owner and sole shareholder: ______________________   Charles Edward Pleasant, Jr., Chief Executive Officer   Date: __________
Interim CEO designate: ______________________   Judy Ann Adams, Vice President and Director   Date: __________
Alternate: ______________________   Alitalia Adams, Secretary and Director   Date: __________

SCHEDULE A — ELIGIBLE BUYERS
Judy Ann Adams — Vice President / Interim CEO designate — option share ____%
Alitalia Adams — Secretary and Director — option share ____%
____________________ — ____________________ — option share ____%

SCHEDULE B — AGREED VALUE
Date set: __________   Agreed value of 100% of shares: $__________   Owner initials: ______   Board approval (Quorum resolution): __________
Date set: __________   Agreed value of 100% of shares: $__________   Owner initials: ______   Board approval (Quorum resolution): __________

SCHEDULE C — INSURANCE FUNDING
Key-person life — Insurer / No.: __________   Owner of policy: the Corporation   Beneficiary: the Corporation   Face amount: $__________
Disability buy-out — Insurer / No.: __________   Owner of policy: __________   Beneficiary: __________   Face amount: $__________`,

  est_letter: `LETTER OF INSTRUCTION
Estate binder of Charles Edward Pleasant, Jr. — for Judy Ann Adams and Alitalia Adams

Judy and Alitalia — if you are reading this, something has happened to me. This letter is not a legal document; it is the map. The legal documents are the nine Estate tabs in Quorum and the signed originals in the binder. Take your time, use the contacts below, and work the lists in order. Nothing here needs to be done in the first day except keeping the businesses running and taking care of each other.

1. THE BINDER (WHAT IS IN IT)
1.1 Last Will and Testament (pour-over) — Judy, Executor; Alitalia alternate. Original kept at: __________________.
1.2 Revocable Living Trust and Certification of Trust — Judy, successor Trustee; Alitalia alternate. Original kept at: __________________.
1.3 Assignment of FORCATA shares to the Trust — Trustee. Corporate book / Quorum.
1.4 Durable Power of Attorney (financial) — Judy, Agent; Alitalia alternate — during my life only. Original kept at: __________________.
1.5 Advance Medical Directive — Judy, health care Agent; Alitalia alternate. Copies: Judy, physician, phone.
1.6 Digital Assets Authorization — Agent / Executor / Trustee. Kept with the password envelope.
1.7 Beneficiary Designation Plan and confirmations — reference.
1.8 Business Succession and Buy-Sell Plan — Judy, Interim CEO; Alitalia alternate; the Board. Corporate book / Quorum.
1.9 This Letter of Instruction.

2. FIRST 48 HOURS
2.1 If I am incapacitated (not deceased): use the Power of Attorney and the Medical Directive. Judy makes decisions. The Trust (Article II, 2.2) lets Judy step in as Trustee with two physicians' letters. Do not use the Will — it operates only at death.
2.2 If I have died: order 10 to 12 certified death certificates from the funeral home (banks, insurers, SAM.gov, and the Louisiana clerk will each want one).
2.3 Call the people in Section 3. Call the attorney first; the CPA second.
2.4 Secure my phone and laptop (device PINs are in the sealed envelope — Section 7). Keep my phone number active for at least 12 months; it receives two-factor codes.
2.5 Keep paying: rent or mortgage, utilities, insurance premiums, and the businesses' payroll. The POA (if alive) or the Trust and Executor (if deceased) authorizes it.

3. KEY CONTACTS
Spouse / Executor / Trustee / Agent — Judy Ann Adams — __________________
Child / alternate for all roles — Alitalia Adams — __________________
Estate attorney (Virginia) — __________________ — __________________
Louisiana succession / property attorney — __________________ — __________________
CPA / tax preparer — __________________ — __________________
Insurance agent(s) — __________________ — __________________
Registered agent — [STATE] — __________________
Registered agent — [FOREIGN STATE] (foreign qualification) — __________________
Business banker — __________________ — __________________
Pointe Coupee Parish Clerk of Court (recording) — 201 E. Main St., New Roads, LA — eclerksla.com
Pointe Coupee Sheriff, Civil and Tax Division (property tax) — 225-638-5433
Pointe Coupee Assessor — 211 E. Main St., Ste 4, New Roads — 225-638-7077

4. THE BUSINESSES
4.1 Adams Infinite Legacy — [STATE] corporation, Corporation ID [CORPORATION ID]; foreign-qualified in [FOREIGN STATE]; EIN [EIN]; [ADDRESS], [CITY]; IT and government contracting; board: Charles (CEO), Judy (VP), Alitalia (Secretary); governance and documents in Quorum (app.quorumsuite.com). What to do: follow the Succession Plan — board resolution in Quorum confirming Judy as Interim CEO within 10 days; update bank signers and the SAM.gov Entity Administrator; continuity letter to contracting officers and customers. The shares are in the Trust — Judy votes them as Trustee.
4.2 Paragon Government Solutions LLC — State: ______; EIN ______; my interest ____%; manager/members: ______________. The membership interest is in the Trust (Schedule A). Check the operating agreement for manager succession; Judy as Trustee steps into my member rights.
4.3 Paragon WebStudio — entity type: ______; EIN/DBA: ______; clients and hosting: ______________. Keep domains and hosting paid (Digital Assets Authorization). Decide within 90 days to continue, transfer, or wind down.
4.4 DebtDefense — entity type: ______; EIN/DBA: ______; licenses and compliance: ______________. Confirm any regulatory or licensing obligations before continuing operations; notify clients.

5. REAL PROPERTY
5.1 Pointe Coupee Parish, Louisiana — five parcels: 00797700 (St. Mary St. lots); 00797800 (807 Richey St., house); 00797900 (Richey St. lot); 00798000 (905 St. Mary St., house); 00798010 (Morningside, Lot 17). These were my mother's (Ann Marie St. Amant Pleasant, d. Dec. 13, 2023). My undivided interest as her sole heir was recognized by the Small Succession Affidavit recorded October 20, 2026, Conveyance Book 9898. I am contributing that interest to the Corporation by an Act of Contribution — check whether it was recorded (if recorded, the Corporation owns it; if not, the Trust or estate does and the Trustee may complete the transfer).
5.2 These are heirs' property — we own a fraction, with other relatives. No one can sell a whole parcel without us; a co-owner can only force a sale through a court partition, where we get notice, an appraisal, and a right to buy them out.
5.3 The biggest risk is unpaid property tax. Each year confirm all five parcels are paid (Sheriff, 225-638-5433). Pay them if others do not — the payer is reimbursed from the others.
5.4 The Assessor still shows my mother's name until notified; send the recorded documents and ask them to update.
5.5 Residence: 9450 Fairfax Blvd., Apt. 1339, Fairfax, VA 22031 — [ ] own [ ] lease; landlord or lender: ______________________.

6. ACCOUNTS, INSURANCE, RETIREMENT, DEBTS
The complete list with institutions, last-four digits, and beneficiaries is the Beneficiary Designation Plan. Life insurance policies: ______________________ (policy numbers in the sealed envelope). Retirement accounts: ______________________. Debts and recurring obligations: ______________________. Safe-deposit box: ______________ (key location: ______________).

7. PASSWORDS AND DIGITAL ACCESS
Credentials are not written in this binder. The master password to my password manager (______________) and my device PINs are in a sealed envelope kept at ______________________. The Digital Assets Authorization gives you the legal right to use them. Priorities: email first (it resets everything else), then banking, then Quorum, SAM.gov and login.gov, domains, and the password manager itself.

8. PERSONAL WISHES
Funeral or memorial: [ ] burial [ ] cremation; location and preferences: ______________________________________________. Faith community or officiant: ______________________. People to notify personally: ______________________________________________. Anything else I want you to know: ______________________________________________________________________.

9. FIRST 30 / 90 DAYS CHECKLIST
9.1 Probate: file the Will with the Fairfax County Circuit Court Clerk (Probate) and qualify Judy as Executor — the self-proving affidavit means no witnesses are needed. Because most assets are in the Trust or pass by beneficiary form, probate should be small.
9.2 Trust: Judy signs an acceptance as successor Trustee; obtain a trust EIN; present the Certification of Trust to banks.
9.3 Claim life insurance and retirement benefits.
9.4 The Corporation and the other entities: Succession Plan steps; [STATE] annual report and [FOREIGN STATE] registration kept current.
9.5 Louisiana: confirm the Act of Contribution was recorded; confirm taxes paid; update the Assessor.
9.6 Taxes: final individual return (and trust or estate returns if needed) with the CPA.
9.7 Close or memorialize personal digital accounts after 12 months.

10. UPDATE LOG
Date: __________   Binder created   Initials: ______
Date: __________   ______________________________   Initials: ______
Date: __________   ______________________________   Initials: ______

Signed: ______________________   Charles Edward Pleasant, Jr.   Date: __________`,
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
  operating: "The Operating Agreement is the LLC's core governing document — ownership, management, voting, profit distributions, and what happens when a member leaves. Even single-member LLCs should have one. All members sign.",
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
  { id: 'consent', name: 'Organizational Consent of Members', cat: 'Governance', updated: 'Draft', pages: 3, vote: true },
  { id: 'ledger', name: 'Membership Ledger & Capital Contributions', cat: 'Equity', updated: 'Draft', pages: 1 },
  { id: 'memberaction', name: 'Member Action & Vote', cat: 'Governance', updated: 'Draft', pages: 2, vote: true },
]

const LLC_INFO: Record<string, DocInfo> = {
  operating: { desc: "The LLC's core governing document — ownership percentages, management structure, voting, profit and loss allocation, distributions, and member transfer/exit rules.", todo: 'All members sign electronically. Keep it with the company records — banks and investors will ask for it.' },
  consent: { desc: 'A written consent the members sign to adopt the Operating Agreement, authorize banking, admit members, and ratify organizational acts — without holding a formal meeting.', todo: 'Confirm the resolutions, then route to all members to sign electronically.' },
  ledger: { desc: 'The ownership record — each member, their membership interest (%), and the capital they contributed.', todo: 'Update it whenever a member is admitted, contributes capital, or transfers interest.' },
  memberaction: { desc: 'A reusable record of a member decision, approved by vote or by written consent per the Operating Agreement.', todo: 'Describe the matter and how it was approved, then the members sign to record the decision.' },
}

const LLC_BODIES: Record<string, string> = {
  operating: `OPERATING AGREEMENT OF ADAMS INFINITE LEGACY, LLC
A [STATE] Limited Liability Company

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
[EACH MEMBER SIGNS]   Date: [____]`,

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
[EACH MEMBER SIGNS]   Date: [____]`,

  ledger: `MEMBERSHIP LEDGER & CAPITAL CONTRIBUTIONS — ADAMS INFINITE LEGACY, LLC
As of [DATE]

Member                     Interest %     Capital Contributed     Contribution Type
[Member 1]                 [%]            $[AMOUNT]                [cash / property / services]
[Member 2]                 [%]            $[AMOUNT]                [cash / property / services]
-----------------------------------------------------------------------------------
TOTAL                      100%           $[TOTAL]

[Update whenever a member is admitted, contributes capital, or transfers interest.]`,

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
    docCategories: ['Governance', 'Fundraising', 'Donor Letters', 'Compliance'],
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
    docCategories: ['Governance', 'Equity', 'Compliance', 'Formation', 'Estate'],
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
    docCategories: ['Governance', 'Equity', 'Compliance', 'Formation'],
  },
}

export const ENTITY_TYPES: EntityType[] = ['nonprofit', 'c_corp', 'llc']

export function entityConfig(t: EntityType | string | undefined): EntityConfig {
  return ENTITY_CONFIG[(t as EntityType) in ENTITY_CONFIG ? (t as EntityType) : 'nonprofit']
}
