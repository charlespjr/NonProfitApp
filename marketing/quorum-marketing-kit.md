# Quorum — Marketing Kit
*Everything needed to produce marketing videos, posts, and decks — including ready-to-paste prompts for NotebookLM's Video Overview / Audio Overview features.*

---

## 1. Positioning

**Product:** Quorum — The Nonprofit Board OS
**One-liner:** Every board decision, document, and deadline — in one place.
**Tagline flow:** Form · Sign · Vote · Meet · Comply

**Elevator pitch (30 seconds):**
Starting a nonprofit means drowning in paperwork: state filings, IRS forms, bylaws, board votes, signatures from seven different people. Quorum is the private portal that guides a founder from "we have an idea" to a fully compliant 501(c)(3) — a 27-step launch checklist in plain English, e-signatures routed to the whole board, formal votes with live tallies, and meetings with one-click Zoom. It was built running a real California nonprofit's launch, not invented in a boardroom.

**Audience:**
- Primary: founders forming a new US nonprofit (especially California), typically 1 founder + a volunteer board of 5–9 people
- Secondary: existing small-nonprofit boards replacing email chains, shared drives, and paper signatures

**Differentiators:**
1. **Sequenced, plain-English launch checklist** — 27 steps across 5 stages in the legally sensible order (EIN before bank account, federal 1023 before state 3500A), each with where-to-go / what-it-costs / what-to-bring instructions
2. **Board-native** — votes, recusals, signature routing, and reminders are first-class, not bolted on
3. **Real-world proven** — built running Adams Infinite Legacy, an actual California 501(c)(3)
4. **AI where it helps** — a passed motion drafts its own formal resolution, ready for counsel review and e-signature

**Pricing (founding-member, locked for life):** Growth subscription + Launch Partner ($490 one-time white-glove setup + Growth). *Do not quote exact monthly pricing in videos — say "founding-member pricing, locked for life."*

**URLs:**
- Marketing site: https://quorum-board-os.vercel.app
- App (self-serve signup): https://non-profit-app-six.vercel.app

---

## 2. Screenshot inventory

All images are 1920px PNGs, warm/terracotta theme, showing a realistic mid-launch state for a fictional-but-real-feeling foundation. Public URLs (usable directly in tools that ingest links); the same files live in this repo at `quorum/shots/`.

| # | File / URL | What it shows | Voice-over angle |
|---|---|---|---|
| 1 | [dashboard.png](https://quorum-board-os.vercel.app/shots/dashboard.png) | Greeting, launch-progress ring (30%), 4 KPIs (awaiting signature, signed, open tasks, next meeting), checklist snapshot, recent documents, upcoming meetings with Join buttons | "One glance tells you exactly where the launch stands." |
| 2 | [checklist.png](https://quorum-board-os.vercel.app/shots/checklist.png) | 27-step launch checklist across 5 sequential stages; completed steps struck through; every step has plain-English instructions; linked documents open for signing | "It tells you what to do, where to go, what it costs — in the right order." |
| 3 | [votes.png](https://quorum-board-os.vercel.app/shots/votes.png) | A live motion ("Adopt the Bylaws") with segmented For/Against/Abstain tally bar, per-director rows, Zoom vote-meeting chip, "board emailed" pill, AI draft footer | "Formal board decisions without the email chaos — every director votes from anywhere." |
| 4 | [calendar.png](https://quorum-board-os.vercel.app/shots/calendar.png) | July month grid with board meetings, Google Calendar connected pill, Zoom connected, "This month" rail with Join Zoom buttons | "Meetings and filing deadlines, one calendar, one click to join." |
| 5 | [documents.png](https://quorum-board-os.vercel.app/shots/documents.png) | Document library: bylaws, minutes, resolutions, sponsorship docs, donor letters — each with plain-language description, status badge (Draft / Awaiting signatures / Fully signed), Open-in-DocuSeal buttons | "Every governance document explained in plain language — and routed for legal e-signature." |
| 6 | [email.png](https://quorum-board-os.vercel.app/shots/email.png) | The exact email each director receives for a vote: motion details, discussion-meeting time, Zoom link, big "Review & vote in the portal" button | "Your board doesn't learn a new tool — the vote comes to their inbox." |

**Suggested visual order for a feature-tour video:** 1 → 2 → 5 → 3 → 6 → 4 (status → to-do → paperwork → decision → notification → schedule).

### 2b. Full-app screenshot set (14 shots — every screen and modal)

Captured at retina resolution (**3840×2200**) from the real product running as "Adams Infinite Legacy" with a 7-member board and populated mid-launch data. Files live in this repo at `marketing/app-screenshots/`; public URLs below work directly as NotebookLM sources (`https://raw.githubusercontent.com/charlespjr/NonProfitApp/main/marketing/app-screenshots/<file>`).

| File | What it shows | Marketing angle |
|---|---|---|
| `01-signin.png` | Sign-in screen with Quorum brand panel | "Your board's private front door" |
| `02-register.png` | "Create your foundation" self-serve registration | "From zero to your own portal in one minute" |
| `03-dashboard.png` | Admin dashboard: progress ring, KPIs, checklist snapshot, meetings | "One glance = launch status" |
| `04-checklist.png` | 27-step / 5-stage launch checklist with plain-English help | "The roadmap the IRS never sends you" |
| `05-documents.png` | Document library with signature-status badges | "Paperwork that explains itself" |
| `06-docuseal-modal.png` | DocuSeal signing modal: document preview, signer roster, progress bar, remind buttons | "Seven signatures without printing a page" |
| `07-votes.png` | Motion card with live For/Against/Abstain tally and per-director rows | "Every decision on the record" |
| `08-email-preview.png` | The exact vote-request email each director receives | "Meets your board in their inbox" |
| `09-new-motion-modal.png` | New-motion form with auto Zoom + calendar + email note | "One form starts the whole vote" |
| `10-ai-draft-modal.png` | AI-drafted board resolution (recitals, resolutions, signature block), editable, Send-to-DocuSeal | "A passed motion writes its own paperwork" |
| `11-calendar.png` | Month view + Google Calendar / Zoom connected, This-month rail | "Meetings and deadlines, one view" |
| `12-notes.png` | Private notes list + editor with autosave | "The founder's own scratchpad" |
| `13-team-access.png` | Team & Access: subscription card, Hostinger email card, member table with permissions | "Volunteer-board-friendly logins — and where you upgrade" |
| `14-manage-access-modal.png` | Manage-access modal: username, personal email, temp password generator, Vote/Sign toggles | "Grant exactly the access each member needs" |

---

## 3. Feature breakdown (benefit-first)

**Launch Checklist — "Your roadmap to 501(c)(3)"**
27 steps across 5 stages: Form the Corporation & Get Your Tax ID → Hold the Organizational Board Meeting → Banking, Signatories & Insurance → Tax Exemption & Charitable Registration → Ready to Raise Money. Sequenced the way the law actually requires. Every step carries plain-English help: which website, what fee, what deadline (SI-100 within 90 days; CT-1 within 30 days of receiving money; 1023 best within 27 months). Steps with paperwork link straight to the document that satisfies them.

**Documents & e-signature — "Paperwork that explains itself"**
Twelve seeded governance/fundraising/donor documents plus anything the AI drafts. Each has a plain-language "what this is" and "what to do." One click routes it to the full board through DocuSeal; the portal tracks Draft → Awaiting signatures → Fully signed, sends reminders, and shows who's holding things up.

**Board Votes — "Decisions with a paper trail"**
Any member of the board can be put on record: create a motion, every director votes For/Against/Abstain, majority logic computes Passed/Failed live. Creating a motion auto-schedules a Zoom discussion meeting, adds it to the calendar, and emails every voting director. When a motion passes, **AI drafts the formal resolution** — recitals, operative clauses, signature block for all seven directors — ready for attorney review and one-click routing to DocuSeal.

**Calendar — "Never miss a meeting or a deadline"**
Google Calendar sync, board meetings and filing deadlines in one month view, one-click Zoom joins.

**Board email notifications — "Meets your board where they are"**
Directors don't hunt for a login; the motion, meeting time, Zoom link, and a vote button arrive in their personal inbox, sent from the foundation's own address.

**Team & Access — "Volunteer-board friendly"**
Board members get a simple username + password (no work email needed). Vote and Sign permissions per member. Invited members set their own password on first login. Notes stay private to each user.

**Multi-organization SaaS**
Any nonprofit can self-register ("Create your foundation"), get a clean-slate portal, invite their board, and subscribe — each organization's data fully isolated.

**Honesty guardrails for all marketing (important):**
- Never claim Quorum files forms *for* you or provides legal/tax advice — it *guides* and *organizes*; documents should be reviewed by counsel
- Say "built running a real California 501(c)(3) launch," not "approved/endorsed by the IRS/state"
- Checklist count is **27 steps / 5 stages** (not 38/7 — that's outdated)

---

## 4. NotebookLM instructions

**Setup (2 minutes):**
1. Create a new NotebookLM notebook called "Quorum Marketing"
2. Add sources: (a) this document, (b) the marketing site URL https://quorum-board-os.vercel.app, (c) the screenshots — upload the PNGs from `marketing/app-screenshots/` (preferred) or add their raw URLs as sources
3. Use **Video Overview** (or Audio Overview for podcast-style) and paste one of the prompts below into "customize"

**Screenshot quality note:** the app screenshots are captured at retina resolution (3840×2200). Every prompt below already instructs NotebookLM to show them large and legible; if you write your own prompts, always include: *"Display the provided high-resolution screenshots full-frame or gently zoomed/panned — never shrunken into small thumbnails or collages; on-screen UI text must remain readable."*

### Prompt A — 90-second product explainer

> Create a 90-second product explainer video for Quorum, "The Nonprofit Board OS." Audience: someone who has just decided to start a nonprofit and is overwhelmed by the paperwork. Structure: (1) open on the pain — forming a 501(c)(3) means dozens of government filings, board votes, and signatures scattered across email, drives, and paper; (2) introduce Quorum as the single private portal that guides the launch: a 27-step plain-English checklist in the legally correct order, e-signatures routed to the whole board, formal votes with live tallies, and meetings with one-click Zoom; (3) highlight that it was built while launching a real California 501(c)(3); (4) close with the call to action: "Start free at quorum-board-os.vercel.app." Tone: warm, competent, founder-to-founder — reassuring, never corporate or legalistic. Use the dashboard, checklist, and votes screenshots as key visuals. Never claim it gives legal advice or files forms on the user's behalf; it guides and organizes. Display the provided high-resolution screenshots full-frame or gently zoomed and panned — never as small thumbnails or collages; on-screen UI text must remain readable.

### Prompt B — 2-minute feature tour (screen by screen)

> Create a 2-minute walkthrough video of Quorum, the board portal for new nonprofits, moving screen by screen in this order: Dashboard ("one glance shows launch progress, signatures pending, and the next meeting"), Launch Checklist ("27 steps across 5 stages, each explained in plain English with the exact website, fee, and deadline"), Documents ("every governance document explained, then routed to the whole board for legal e-signature with live status"), Board Votes ("create a motion, every director votes For, Against, or Abstain, and a passed motion can draft its own formal resolution with AI"), Board Email ("directors get the vote in their inbox with the meeting time and a Zoom link — no new tool to learn"), Calendar ("meetings and government deadlines in one view"). Use the matching screenshot for each segment. Tone: practical product demo, second person ("you see… you click…"). End with: founding-member pricing locked for life — start free. Display each screenshot large and legible — full-frame or slowly panning across the interface; never shrink them into grids or thumbnails.

### Prompt C — founder-story / problem-first (emotional)

> Create a 60-second story-driven video. Protagonist: a founder starting a nonprofit to help people with chronic illness, juggling a day job and a volunteer board of seven. Beat 1: the dream — the mission, the festival, the people they'll help. Beat 2: the wall — Articles, EIN, bylaws, conflict-of-interest policies, bank resolutions, IRS Form 1023, state registrations, seven signatures on everything; the dream drowning in paperwork. Beat 3: the turn — Quorum lays out all 27 steps in order, in plain English, collects every signature electronically, records every board vote, and even drafts the formal documents when a motion passes. Beat 4: the payoff — the founder's evenings go back to the mission, not the paperwork. Close: "Quorum — The Nonprofit Board OS. Every board decision, document, and deadline, in one place. Start free." Tone: cinematic but grounded; hopeful. No legal-advice claims. When screenshots appear, show them large and readable — slow push-ins beat tiny collages.

### Prompt D — 30-second social cut

> Create a punchy 30-second vertical-friendly video for social media. Hook (first 3 seconds): "Starting a nonprofit? The IRS doesn't send you a checklist. We did." Then three rapid beats over screenshots: "27 steps, in the right order, in plain English" (checklist), "Every signature, collected electronically" (documents), "Every board vote, on the record" (votes). Close: "Quorum — The Nonprofit Board OS. Start free." High energy, text-forward, minimal narration. Screenshots must fill the frame (crop to the relevant region for vertical format) — keep UI text legible, no thumbnail grids.

### Prompt E — in-depth tutorial: "How to use Quorum" (5–8 minutes)

> Create a detailed 5–8 minute tutorial video titled "How to use Quorum — from signup to your first board vote." Audience: a nonprofit founder who just created an account and wants to be walked through the whole app, step by step, in second person. Use the numbered app screenshots as the visuals for each chapter, displayed full-frame and legible — zoom into the exact region being described (a button, a badge, a form field) rather than showing tiny overviews. Chapters, in order:
> 1. **Create your foundation** (screenshots 01-signin, 02-register): from the marketing page click Start free; fill in organization name, your name, email, username, and a password of 8+ characters; you land in your own private portal as the administrator.
> 2. **Read your dashboard** (03-dashboard): the progress ring shows launch progress; the four cards show documents awaiting signature, documents fully signed, open checklist tasks, and your next meeting; below are your next four tasks, recent documents, and upcoming meetings.
> 3. **Work the Launch Checklist** (04-checklist): 27 steps in 5 stages, in the legally sensible order — do them top to bottom; each step's gray text says exactly where to go, what it costs, and any deadline; click the checkbox when a step is done and the progress ring updates; steps with a linked document have an Open button that takes you straight to signing.
> 4. **Send a document for signatures** (05-documents, 06-docuseal-modal): the Documents library lists every governance, fundraising, and donor document with a plain-language description and a status badge — Draft, Awaiting signatures, or Fully signed; click "Open in DocuSeal" to see the signer roster; "Email board to sign" notifies everyone; the progress bar fills as each director signs.
> 5. **Invite your board** (13-team-access, 14-manage-access-modal): in Team & Access click Add member; enter their name, a username, their personal email, and click Generate for a temporary password you share privately; toggle Vote and Sign permissions; they'll be asked to choose their own password on first sign-in.
> 6. **Run a board vote** (09-new-motion-modal, 07-votes, 08-email-preview): click New motion, describe the decision, optionally link a meeting; creating it schedules a Zoom discussion, adds it to the calendar, and emails every voting director; each director votes For, Against, or Abstain; the tally bar and result badge update live; "Preview email" shows exactly what the board receives.
> 7. **Let AI draft the paperwork** (10-ai-draft-modal): when a motion passes, click "Draft document with AI" — Quorum writes a formal board resolution with recitals, operative clauses, and a signature block for every director; edit it, have your attorney review, then "Send to DocuSeal" routes it for signatures.
> 8. **Calendar and Notes** (11-calendar, 12-notes): connect Google Calendar and Zoom once; meetings and filing deadlines share one month view with one-click joins; Notes is your private scratchpad with autosave — no one else can read it.
> Tone: patient, encouraging instructor — like a friend showing you around; celebrate small wins ("that's your first signature collected"). Remind viewers once that Quorum organizes and guides but doesn't replace advice from your attorney or accountant. End: "You're ready — your board is one place now. Quorum, The Nonprofit Board OS."

**Voice & style guide for all outputs:** warm terracotta/cream aesthetic; serif headlines feel; words to use: *guide, plain English, in order, on the record, one place*; words to avoid: *disrupt, revolutionary, compliance solution, legal advice, guaranteed*.

---

## 5. Ready-made copy snippets

- **X/LinkedIn bio:** Quorum — The Nonprofit Board OS. Launch checklist, board votes, e-signatures & meetings for new 501(c)(3)s. Built running a real foundation. Start free.
- **App store style short description:** The private portal that takes your nonprofit from formation to fully compliant 501(c)(3) — without the paperwork chaos.
- **Email signature line:** Launching a nonprofit? Quorum turns 27 government steps into one guided checklist → quorum-board-os.vercel.app
