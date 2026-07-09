import type {
  Account,
  ChecklistPhase,
  DocInfo,
  Meeting,
  Member,
  PortalDoc,
} from '../types'

export const MEMBERS: Member[] = [
  { id: 'alitalia', name: 'Alitalia Adams', role: 'President & Founder', initials: 'AA' },
  { id: 'judy', name: 'Judy Adams', role: 'Vice Chair', initials: 'JA' },
  { id: 'lee', name: 'Lee Taylor II', role: 'Treasurer (CFO)', initials: 'LT' },
  { id: 'courtney', name: 'Courtney Woo', role: 'Secretary', initials: 'CW' },
  { id: 'charles', name: 'Charles Pleasant', role: 'Chief Information Officer', initials: 'CP' },
  { id: 'joe', name: 'Joe Grumbine', role: 'Community Health Education Chair', initials: 'JG' },
  { id: 'nancy', name: 'Nancy Hughes', role: 'Philanthropy Chair', initials: 'NH' },
]

export const SEED_ACCOUNTS: Record<string, Account> = {
  alitalia: { username: 'alitalia', email: 'alitalia.adams@gmail.com', status: 'active', vote: true, sign: true, admin: true },
  judy: { username: 'judy.adams', email: 'judyadams54@gmail.com', status: 'active', vote: true, sign: false },
  lee: { username: 'lee.taylor', email: 'leetaylor.ii@outlook.com', status: 'active', vote: true, sign: false },
  courtney: { username: 'courtney.woo', email: 'cwoo.design@gmail.com', status: 'active', vote: true, sign: false },
  charles: { username: 'charles.p', email: 'charles.pleasant@yahoo.com', status: 'active', vote: true, sign: false },
  joe: { username: 'joe.grumbine', email: 'jgrumbine@gmail.com', status: 'active', vote: true, sign: false },
  nancy: { username: 'nancy.hughes', email: 'nancy.hughes22@gmail.com', status: 'active', vote: true, sign: false },
}

export const BASE_DOCS: PortalDoc[] = [
  { id: 'bylaws', name: 'Bylaws of Adams Infinite Legacy', cat: 'Governance', updated: 'Jun 24, 2026', pages: 18 },
  { id: 'minutes', name: 'Organizational Board Minutes', cat: 'Governance', updated: 'Jun 20, 2026', pages: 4 },
  { id: 'resolution', name: 'Board Resolution & Written Consent', cat: 'Governance', updated: 'Jul 1, 2026', pages: 3 },
  { id: 'boardvote', name: 'Board Action & Vote', cat: 'Governance', updated: 'Jul 1, 2026', pages: 2 },
  { id: 'festivalresolution', name: 'Board Resolution — Festival & Sponsorship', cat: 'Governance', updated: 'Jul 2, 2026', pages: 2 },
  { id: 'prospectus', name: 'Sponsorship Prospectus — Get Well Soon Festival', cat: 'Fundraising', updated: 'Jun 27, 2026', pages: 2 },
  { id: 'sponsoragreement', name: 'Sponsorship Agreement (per sponsor)', cat: 'Fundraising', updated: 'Jul 2, 2026', pages: 3 },
  { id: 'sponsorack', name: 'Sponsor Acknowledgment Letter', cat: 'Fundraising', updated: 'Jun 27, 2026', pages: 1 },
  { id: 'cash', name: 'Donor Letter — Cash Gift', cat: 'Donor Letters', updated: 'Jun 18, 2026', pages: 1 },
  { id: 'inkind', name: 'Donor Letter — In-Kind Gift', cat: 'Donor Letters', updated: 'Jun 18, 2026', pages: 1 },
  { id: 'quidpro', name: 'Donor Letter — Quid Pro Quo', cat: 'Donor Letters', updated: 'Jun 18, 2026', pages: 1 },
  { id: 'yearend', name: 'Donor Letter — Year-End Summary', cat: 'Donor Letters', updated: 'Jun 18, 2026', pages: 1 },
]

export const DOC_INFO: Record<string, DocInfo> = {
  bylaws: { desc: 'The rulebook for how the foundation operates — its purpose, board, officers, meetings, and required policies.', todo: 'Have California nonprofit counsel review, then the full board adopts and signs. Certify it and keep it in the corporate records.' },
  minutes: { desc: 'The official record of your first (organizational) board meeting and the resolutions that formally start the corporation.', todo: 'Confirm the details (dates, addresses, filing numbers), then the board approves and the Secretary & President sign.' },
  resolution: { desc: 'A written consent that authorizes banking, credit cards, signatories, and other corporate actions without holding a separate meeting.', todo: 'Fill in the institution / account details and authorized signatories, then all directors sign to authorize.' },
  boardvote: { desc: 'A reusable record of a board decision — approved either by a vote at a meeting or by unanimous written consent.', todo: 'Describe the matter and how it was approved, then have the directors sign to record the decision.' },
  festivalresolution: { desc: 'The resolution that officially establishes the Get Well Soon Wellness Festival as a program of the foundation and approves the tiered sponsorship program.', todo: 'Adopt at a board meeting or by written consent, then route to all directors to sign in DocuSeal.' },
  prospectus: { desc: 'The sponsorship menu for the Get Well Soon Wellness Festival — the tiers, benefits, and recognition offered to sponsors.', todo: 'Set the tier prices, confirm the acknowledgment-vs-advertising wording with a tax advisor, then publish and share it with prospects.' },
  sponsoragreement: { desc: 'The agreement completed for each individual sponsor — their details, level, and benefits — with a page explaining what each level means and a board-approval page. The board approves and both parties sign.', todo: "Fill in the sponsor's details, level, and amount; the board approves (vote), then the sponsor and an officer sign in DocuSeal." },
  sponsorack: { desc: "A letter that formally acknowledges a sponsor's support and any benefits they received in return.", todo: 'Fill in the sponsor, amount, date, and recognition; note the value of any benefits provided; sign and send.' },
  cash: { desc: 'A tax-receipt letter thanking a donor for a cash gift, with the IRS wording they need to deduct it.', todo: 'Insert the amount, date, and EIN; confirm no goods or services were given; sign and send to the donor.' },
  inkind: { desc: 'A receipt for a donated item or service — it describes the gift but does not state a dollar value.', todo: 'Describe the donated item, add the date and EIN (no value), then sign and send.' },
  quidpro: { desc: 'A receipt for a payment where the donor got something in return (like an event ticket) — it shows the deductible portion.', todo: 'Enter the payment, the fair-market value received, and the deductible difference; add the EIN; sign and send.' },
  yearend: { desc: "A year-end summary of all of a donor's contributions during the year, for their tax records.", todo: 'List the gifts and total for the year, add the year and EIN; sign and send in January.' },
}

/** Ordered stages — the sequence is meaningful (EIN before bank account,
 *  federal 1023 before state 3500A). Keep the array order intact. */
export const PHASES: ChecklistPhase[] = [
  {
    name: 'Form the Corporation & Get Your Tax ID',
    items: [
      { id: 'articles', label: 'File Articles of Incorporation with the CA Secretary of State' },
      { id: 'ein', label: 'Obtain a federal Employer Identification Number (IRS Form SS-4)' },
    ],
  },
  {
    name: 'Hold the Organizational Board Meeting',
    items: [
      { id: 'orgmeeting', label: 'Hold the organizational meeting of the Board of Directors' },
      { id: 'bylaws', label: 'Adopt & certify the Bylaws', doc: 'bylaws' },
      { id: 'officers', label: 'Elect officers and record them in the minutes' },
      { id: 'office', label: "Set the corporation's principal office address" },
      { id: 'fiscalyear', label: 'Establish the fiscal year-end (December 31)' },
      { id: 'nocomp', label: 'Confirm directors serve without compensation (expenses only)' },
      { id: 'coi', label: 'Adopt Conflict of Interest Policy & collect signed disclosures from all directors' },
      { id: 'retention', label: 'Adopt the Document Retention & Destruction Policy' },
      { id: 'whistleblower', label: 'Adopt the Whistleblower Policy' },
      { id: 'giftpolicy', label: 'Adopt the Gift Acceptance Policy' },
      { id: 'privacy', label: 'Adopt the Privacy Notice & Data Protection Policy' },
      { id: 'assistcriteria', label: 'Adopt the Financial Assistance Eligibility & Selection Criteria' },
      { id: 'festival', label: 'Approve & plan the “Get Well Soon” Wellness Festival' },
      { id: 'ratify', label: 'Ratify prior organizational acts of the directors & officers' },
      { id: 'minutes', label: 'Approve & sign the Organizational Board Minutes', doc: 'minutes' },
    ],
  },
  {
    name: 'Banking, Signatories & Insurance',
    items: [
      { id: 'bank', label: 'Open the corporate bank account & designate authorized signatories' },
      { id: 'dualsig', label: 'Set the two-signature threshold for large disbursements' },
      { id: 'insurance', label: 'Obtain D&O and general liability insurance' },
    ],
  },
  {
    name: 'Tax Exemption & Charitable Registration',
    items: [
      { id: 'si100', label: 'File the Statement of Information (Form SI-100)' },
      { id: 'f1023', label: 'File IRS Form 1023 / 1023-EZ for 501(c)(3) recognition & pay the user fee' },
      { id: 'ct1', label: 'Register with the CA Attorney General Registry of Charities (Form CT-1)' },
      { id: 'ftb3500', label: 'File CA FTB Form 3500A after the federal determination letter' },
      { id: 'rrf', label: 'Calendar annual renewals (Form RRF-1) & Form 990 filings' },
    ],
  },
  {
    name: 'Ready to Raise Money',
    items: [
      { id: 'prices', label: 'Set sponsorship tier prices in the Prospectus', doc: 'prospectus' },
      { id: 'donorletters', label: 'Finalize the donor acknowledgment letter templates', doc: 'cash' },
    ],
  },
]

export const TASK_HELP: Record<string, string> = {
  articles: "Go to the California Secretary of State's website (bizfileOnline) and file the Articles of Incorporation for a 501(c)(3). Once approved you get a stamped copy — save it; it's the foundation's birth certificate.",
  orgmeeting: "Gather all seven directors (in person or by video) for the first official meeting. Use the Organizational Board Minutes as your agenda and record what's decided.",
  bylaws: 'Have your attorney review the Bylaws, then the board votes to adopt them at the meeting. Sign them in the portal and keep a copy in your records.',
  officers: 'At the meeting, formally confirm who holds each officer role (President, Treasurer, Secretary, etc.) and write it into the minutes.',
  minutes: 'After the meeting, finish the Minutes with the real dates and decisions. The Secretary and President sign them here in the portal, then file them with your records.',
  office: 'Decide the official mailing address for the foundation and record it in the Bylaws and minutes. It can be your home or a P.O. box.',
  fiscalyear: "Confirm the foundation's financial year runs January 1–December 31 (the standard choice). This sets when your taxes and reports are due.",
  ratify: 'In the minutes, add a line approving any actions taken before the meeting (like reserving the name or early expenses) so they become official.',
  ein: "Apply for a free EIN (the foundation's tax ID) at IRS.gov — search 'apply for EIN online.' Takes about 10 minutes and you get the number right away. You'll need it for the bank account and the 501(c)(3) application.",
  f1023: "File IRS Form 1023 (or the shorter 1023-EZ if you qualify) to become an official 501(c)(3). There's a fee (about $275–$600). This is the big one — consider having your accountant help. Best practice: file within 27 months of the Articles so your exemption is retroactive to formation.",
  ftb3500: 'File California Form 3500A so the foundation is also exempt from state income tax. Do this after the IRS determination letter arrives — it depends on federal approval.',
  si100: 'File Form SI-100 with the CA Secretary of State (online, small fee). It lists your officers and address, and you re-file it every two years. Deadline: within 90 days of filing the Articles.',
  ct1: "Register with the California Attorney General's Registry of Charities (Form CT-1) so you can legally fundraise. Deadline: within 30 days of receiving any money or assets — and before you fundraise.",
  rrf: 'Put the yearly deadlines on your calendar: the California renewal (Form RRF-1) and the IRS Form 990. Missing these can cost your tax-exempt status.',
  coi: 'Adopt the Conflict of Interest Policy at the board meeting, then have every director sign the disclosure form. Keep the signed forms on file.',
  retention: "Adopt the policy that says which records to keep, for how long, and when it's safe to destroy old ones.",
  whistleblower: 'Adopt the policy that lets staff or volunteers report concerns without fear of retaliation.',
  giftpolicy: "Adopt the policy setting rules for what kinds of donations you'll accept (cash easily; certain property only with conditions).",
  privacy: "Adopt the policy explaining how you protect donors' and recipients' personal information.",
  bank: "Take your stamped Articles, EIN letter, and signed Board Resolution to a bank and open the foundation's account. Name who's allowed to sign. (This is why the EIN and signed minutes come first.)",
  dualsig: 'Decide the dollar amount above which two people must approve a payment (many small nonprofits use $2,500) and record it in the minutes.',
  insurance: 'Get quotes for Directors & Officers (D&O) insurance and general liability insurance, then buy coverage to protect the board and the organization.',
  nocomp: 'Confirm in the minutes that directors volunteer their time and are only paid back for real expenses (like travel) — never a salary.',
  assistcriteria: "Write down who qualifies for help and how you'll choose recipients (illness type, need, documents required, award amounts). The board approves it.",
  festival: 'Set a date, budget, and plan for the Get Well Soon Wellness Festival, and have the board approve it as an official program of the foundation.',
  prices: "Decide the price for each sponsor level (Presenting, Gold, Silver, Community) in the Prospectus — then it's ready to send to potential sponsors.",
  donorletters: 'Review the four donor thank-you letter templates and add your EIN so they’re ready to send the moment someone donates.',
}

export const MEETINGS: Meeting[] = [
  { id: 'm1', title: 'Counsel intro call', day: 2, time: '9:00 AM', who: 'Alitalia & nonprofit counsel', zoom: true },
  { id: 'm2', title: 'EIN + bank account errands', day: 6, time: '1:00 PM', who: 'Alitalia, Lee Taylor II' },
  { id: 'm3', title: 'Organizational Board Meeting', day: 8, time: '10:00 AM', who: 'All directors', zoom: true },
  { id: 'm4', title: 'Conflict-of-interest disclosures due', day: 10, time: '5:00 PM', who: 'All directors' },
  { id: 'm5', title: 'Governance policy drafting', day: 13, time: '11:00 AM', who: 'Courtney Woo, Charles Pleasant', zoom: true },
  { id: 'm6', title: 'Bylaws Adoption Review', day: 15, time: '2:00 PM', who: 'Alitalia, Courtney & counsel', zoom: true },
  { id: 'm7', title: 'D&O insurance quote review', day: 20, time: '10:30 AM', who: 'Lee Taylor II, Alitalia', zoom: true },
  { id: 'm8', title: 'Finance Committee', day: 22, time: '11:00 AM', who: 'Lee Taylor II, Alitalia', zoom: true },
  { id: 'm9', title: 'Grant criteria workshop', day: 24, time: '3:00 PM', who: 'Joe Grumbine, Alitalia', zoom: true },
  { id: 'm10', title: 'Sponsor outreach call', day: 27, time: '1:30 PM', who: 'Nancy Hughes', zoom: true },
  { id: 'm11', title: 'Festival Planning Kickoff', day: 29, time: '3:00 PM', who: 'Nancy Hughes, Joe Grumbine', zoom: true },
]

/** Per the production checklist, a new organization starts with a clean
 *  slate: no tasks done, no signatures, no notes, no motions. */
export const SEED_NOTES = []
export const SEED_MOTIONS = []
