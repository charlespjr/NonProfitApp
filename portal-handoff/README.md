# Handoff: Adams Infinite Legacy — Founder & Board Portal

## Overview
A secure web portal for **Adams Infinite Legacy**, a California nonprofit public benefit corporation (501(c)(3)) that funds medical expenses for people experiencing or surviving chronic illness and runs the annual "Get Well Soon" Wellness Festival. The portal is the founder/admin workspace for **Alitalia Adams** (President & Founder), and a limited **board-member** workspace for the other directors. It lets her:

- Log in securely (username or email + password)
- Track a **foundation launch checklist** (27 formation/governance/compliance tasks)
- Manage **governance & fundraising documents** and route them for **e-signature via DocuSeal** (all board members must sign)
- Run **board votes / motions** — directors vote For / Against / Abstain, results are tallied
- **Draft the document for a passed motion with AI**, then send it to DocuSeal
- See a **Google Calendar**-style meeting calendar
- Keep private **notes**
- Manage **team access** — create board-member logins (username + password), store each member's personal email for DocuSeal delivery, and set permissions; connect a **Hostinger** mailbox for sending

### Roles & permissions
- **Admin (Alitalia):** full access to every screen; `vote` + `sign` rights; the only one who manages Team & Access, drafts documents, and connects integrations.
- **Board member:** signs in with a username + password Alitalia sets; **vote-only** by default (Board Votes + the items they need). They do **not** get a foundation email — their *personal* email is where DocuSeal sends documents to sign. In the prototype every screen is shown from Alitalia's (admin) point of view; in production, gate nav/screens by the logged-in user's role and `vote`/`sign` permissions.

## About the Design Files
The file in this bundle (`Adams Infinite Legacy Portal.dc.html`) is a **design reference created in HTML** — a working prototype that shows the intended look, layout, copy, and behavior. It is **not** production code to ship directly. (It uses a small in-house "Design Component" runtime, `support.js`, purely for the prototype — do not carry that runtime into production.)

**The task:** recreate this design in a real, production codebase. If a codebase/framework already exists, use its established patterns, component library, and conventions. If nothing exists yet, use **React + TypeScript + Vite** with **Tailwind CSS** (or the team's preferred stack) and a real backend for auth, storage, DocuSeal, and Google Calendar.

## Fidelity
**High-fidelity.** Colors, typography, spacing, states, and interactions are final. Recreate the UI faithfully, then wire it to real services. The prototype currently fakes auth (any credentials log in), persists to `localStorage`, and mocks the DocuSeal and Google Calendar integrations — those are the seams to replace with real backends.

---

## Global Layout & Shell
- **Two states:** unauthenticated (login) and authenticated (app shell).
- **App shell:** fixed left **sidebar (250px)** + main column.
  - Sidebar: brand lockup, `WORKSPACE` section label, 7 nav items (Dashboard, Documents, Launch Checklist, Board Votes, Calendar, Notes, Team & Access), and a pinned user card (avatar "AA", "Alitalia Adams / President & Founder", sign-out icon button) at the bottom.
  - Nav items show a count **badge** when relevant (Documents = # awaiting signature; Launch Checklist = # open tasks; Board Votes = # motions the current user hasn't voted on).
  - Active nav item: `--accent-soft` background, `--brand` text, weight 600.
  - Main column: sticky **top bar** (page title + subtitle on the left; a search box `220px` and a primary "New note" button on the right) over a scrollable `<main>` (padding `28px 30px 60px`).
- Preferred desktop width ~**1280px**; the app is a desktop-first admin tool.

## Screens / Views

### 1. Login
- **Purpose:** authenticate Alitalia.
- **Layout:** full-height 2-column grid, left `1.05fr` / right `0.95fr`.
  - **Left brand panel:** `--brand` background, white text, subtle radial highlight overlay top-right. Contains: brand lockup (rounded square "A" glyph + "Adams Infinite Legacy"), uppercase eyebrow "FOUNDER & BOARD PORTAL", a large serif headline ("Everything to launch the foundation, in one place."), a supporting paragraph, and a footer row ("California Nonprofit Public Benefit Corporation" · "IRC § 501(c)(3)").
  - **Right form column:** centered card, max-width `372px`. "Welcome back" (serif, 27px) + subtitle; a **Username or email** input; **Password** input with a "Forgot?" link; a "Keep me signed in" checkbox (accent `--brand`); full-width **Sign in** button; a demo hint box (`--accent-soft`).
- **Inputs:** padding `12px 14px`, `1px solid --line`, radius `10px`, `--panel` bg. Focus: border `--accent` + `0 0 0 3px --accent-soft` ring.
- **Behavior (prototype):** submit logs in with any/no credentials. **Production:** real auth — accept **username OR email** + password (board members log in by username), sessions, ideally 2FA; on success route by role; show `loginError` in a `--danger`/`--warn-soft` chip on failure.

### 2. Dashboard
- **Purpose:** at-a-glance status of the launch.
- **Header row:** greeting ("Good morning/afternoon/evening, Alitalia.") + a **launch-progress card** with a conic-gradient **progress ring** (shows `progressPct%`) and "X of Y tasks complete".
- **KPI row:** 4 cards — *Awaiting signature* (count, `--warn`), *Signed* (count, `--good`), *Open tasks* (count), *Next meeting* (date + title).
- **Body:** two layout options (see Tweaks):
  - *Overview grid* — main/side columns `1.5fr / 1fr`.
  - *Two-column feed* — `1fr / 340px`.
  - **Left column:** "Launch checklist" card (progress bar + next 4 open tasks, each a toggle) and "Recent documents" card (first 4 docs with status badges).
  - **Right column:** "Upcoming meetings" (next 3, each with a date chip) and a `--brand` "Reminder from counsel" callout card linking to Notes.

### 3. Documents
- **Purpose:** library + e-signature routing.
- **Filter tabs:** `All`, `Governance`, `Fundraising`, `Donor Letters` (active = `--accent` border + `--accent-soft` bg), each with a count.
- **Table:** columns `minmax(0,1fr) 130px 170px 150px` = Document / Category / Status / Action, with an uppercase header row.
  - **Document cell:** doc icon tile (`--accent-soft`/`--brand`), doc name (600), a one-line **plain-language description**, and a meta line (`N pp · <sign status text>`).
  - **Status badge:** *Draft* (neutral, `--bg` + `--line` border), *Awaiting signatures* (`--warn-soft`/`--warn`), *Fully signed* (`--good-soft`/`--good`).
  - **Action button:** "Open in DocuSeal" (brand-filled) when not fully signed; "View" (outline) when fully signed. Opens the DocuSeal modal.
- Footer note explaining blue fields are DocuSeal signature fields.

### 4. DocuSeal Signing Modal (overlay)
- **Purpose:** explain a document and collect **all board members'** signatures.
- **Structure:** centered card (max-width `640px`), dimmed backdrop (`rgba(20,18,14,.5)` + blur), pop-in animation.
  - **Header:** DocuSeal logo tile (`#1a73e8`), "DocuSeal / Secure electronic signature", close (X).
  - **Body:** a faux document preview (title + skeleton lines); an **"About this document"** panel (`--accent-soft`) with the doc description + a **"What to do —"** instruction; a **signer roster** header ("Signers · full board required") with an "X of 7 signed" counter and a progress bar; then **one row per board member** (avatar initials — green when signed, gray when pending; name with a "You" chip for Alitalia; role; and either a green "Signed" pill or an action button — "Sign now" for Alitalia / "Remind" for others).
  - **Footer:** status text ("X of N signatures collected via DocuSeal"); buttons: Close, "Remind pending", "Sign all (demo)".
- **Behavior (prototype):** "Sign now" marks Alitalia signed; "Sign all" marks everyone signed and closes; reminders show a toast. **Production:** create/submit a DocuSeal submission per document with the 7 signers, open DocuSeal's embedded signing or hosted URL, and reflect real webhook signature status.

### 5. Launch Checklist
- **Purpose:** 27-step foundation launch tracker, derived from the organizational board minutes' resolutions.
- **Header card:** large progress ring + "Foundation launch checklist" + "X of 27 steps complete…".
- **5 sequential stages**, each a card with a header (stage name + `done/total` pill) and toggleable rows. Stages are ordered **do-them-in-order** — the sequence itself is meaningful (EIN before bank account, federal 1023 before state 3500A, etc.), so keep the array order intact. **Every task shows a plain-language instruction line** beneath its title (where to go, cost, what to bring, and any filing deadline) — see the `TASK_HELP` map in the logic, keyed by task id. Rows with a linked document show an "Open" button (opens DocuSeal modal). Checked rows: filled `--accent` checkbox + strikethrough/40–50% opacity label + help text. Keep this help text in production — it's core to the UX.
- **Stages & items** (in order; ids in parentheses):
  1. **Form the Corporation & Get Your Tax ID** — File Articles of Incorporation w/ CA Secretary of State (`articles`); Obtain federal EIN, Form SS-4 (`ein`).
  2. **Hold the Organizational Board Meeting** — Hold organizational board meeting (`orgmeeting`); Adopt & certify the Bylaws (`bylaws`→doc); Elect officers & record in minutes (`officers`); Set principal office address (`office`); Establish fiscal year-end Dec 31 (`fiscalyear`); Confirm directors serve without compensation (`nocomp`); Adopt Conflict of Interest Policy & collect disclosures (`coi`); Document Retention & Destruction Policy (`retention`); Whistleblower Policy (`whistleblower`); Gift Acceptance Policy (`giftpolicy`); Privacy Notice & Data Protection Policy (`privacy`); Financial Assistance Eligibility & Selection Criteria (`assistcriteria`); Approve & plan the "Get Well Soon" Wellness Festival (`festival`); Ratify prior organizational acts (`ratify`); Approve & sign the Organizational Board Minutes (`minutes`→doc).
  3. **Banking, Signatories & Insurance** — Open corporate bank account & designate signatories (`bank`); Set two-signature threshold for large disbursements (`dualsig`); Obtain D&O + general liability insurance (`insurance`).
  4. **Tax Exemption & Charitable Registration** — File Statement of Information SI-100, within 90 days (`si100`); File IRS Form 1023/1023-EZ & pay user fee, within 27 months (`f1023`); Register w/ CA AG Registry of Charities, Form CT-1, within 30 days (`ct1`); File CA FTB Form 3500A after federal determination (`ftb3500`); Calendar annual RRF-1 & Form 990 (`rrf`).
  5. **Ready to Raise Money** — Set sponsorship tier prices in the Prospectus (`prices`→doc); Finalize donor acknowledgment letter templates (`donorletters`→doc).

### 6. Calendar
- **Purpose:** board meetings & planning sessions.
- **Disconnected state:** centered card with calendar icon, "Connect your calendar", and a **"Connect Google Calendar"** button (real Google "G" logo).
- **Connected state:** header "July 2026" + a green "Google Calendar connected" pill + account email. Layout `1fr / 300px`:
  - **Month grid:** 7-column, Sun–Sat header, cells `min-height:96px` with day numbers; **today (Jul 1, 2026 — a Wednesday)** highlighted (`--brand` circle + `--accent-soft` cell). Events render as `--accent` chips (`<time> <title>`).
  - **"This month" rail:** list of every event (accent left bar, title, "Jul D · time", attendees) + a "Disconnect" button.
- **Behavior (prototype):** connect is a toggle. **Production:** Google OAuth + Calendar API; fetch/create events. (July 1, 2026 is a Wednesday — leading blank cells = 3.)

### 7. Notes
- **Purpose:** private founder notes.
- **Layout:** `300px / 1fr`, height `calc(100vh - 210px)`.
  - **Left:** "New note" button (dashed) + scrollable list of note cards (title, one-line preview, updated label; active card = `--accent-soft`).
  - **Right:** editor — title input (serif, 19px), an autosave indicator ("Saving…" → "Saved"), a delete (trash) button, and a full-height body `<textarea>`. Empty state when no note selected.
- **Behavior:** create/select/edit/delete; autosaves ~600ms after typing. **Production:** persist per-user server-side.

### 8. Board Votes / Motions
- **Purpose:** record formal board decisions with a vote by every director.
- **Header:** title "Board votes & motions" + a **"New motion"** button.
- **Empty state:** centered card ("No motions yet") explaining what motions are for.
- **Motion card** (one per motion):
  - **Header:** title (serif), description, meta line ("Created <date> · <linked meeting>"), a **result badge** (top-right) — *Passed* (`--good-soft`/`--good`), *Failed* (`--warn-soft`/`--danger`), or *Open · voting* (`--bg`/`--muted`) — plus a delete (trash) button.
  - **Tally bar:** a segmented bar (For = `--good`, Against = `--danger`, Abstain = `--muted`) + a legend line ("For N · Against N · Abstain N · N of 7 directors voted").
  - **Voter rows:** one per board member — avatar (colored by their vote), name (+ "You" chip for the current user), role. The current user sees three toggle buttons **For / Against / Abstain** (clicking the active one again clears it); other members show a **"Remind"** button when they haven't voted, or a colored **vote tag** when they have.
  - **Footer action row:** a sparkle icon + hint text + a primary button — **"Draft document with AI"** (before a doc exists) or **"View document"** (after one is generated & linked). Passing a motion changes the hint to "Motion passed — draft the document for signing."
  - **Notification + meeting row** (under the meta line): when a motion has a Zoom vote meeting, a **"Join vote meeting"** chip (opens the Zoom URL); when the board has been emailed, a green **"Board emailed · N sent"** pill; and a **"Email board to vote" / "Resend email"** button. A **"Preview email"** action opens the Email Preview modal (see §12).
- **Creating a motion (important flow):** when Alitalia submits the New Motion form, the prototype does three things at once: (1) **generates a Zoom vote meeting** and its join link (if Zoom is connected), (2) **adds that meeting to the Calendar** — it appears in the month grid and the "This month" rail, scheduled at the linked meeting's slot or the next open day, and (3) **emails every board member with vote access** (via the connected Hostinger mailbox) with the motion details, meeting time, Zoom link, and a "review & vote in the portal" button. The New Motion modal shows an info note stating this. The confirmation toast reflects what happened (e.g. "Motion created · Zoom vote meeting added to calendar · 6 board members emailed"). **Notifications are email-only by design** — no SMS/text (that would require a paid Zoom Phone plan). **Production:** create a real calendar event (Google API), a real Zoom meeting (Zoom API), and send the email via the connected mailbox.
- **Result logic:** majority = `floor(total/2)+1`. `for ≥ majority` → Passed; `against ≥ majority` or all voted without a For-majority → Failed; otherwise Open.
- **Behavior (prototype):** votes are stored locally; "Remind" shows a toast. **Production:** persist votes per director; only a member with `vote` permission can cast their own vote; email reminders via the connected mailbox.

### 9. AI Draft Modal (overlay)
- **Purpose:** turn a passed motion into the formal document, then route it to DocuSeal.
- **Trigger:** "Draft document with AI" on a motion card.
- **Structure:** centered card (max-width `660px`).
  - **Header:** sparkle tile + "AI document draft" + the motion title.
  - **Loading state:** spinner ("Drafting the document from your motion…").
  - **Ready state:** an editable **Document title** input + a large editable **body textarea** (rendered on a white "paper" surface, serif) holding the generated document; a note to review with counsel.
  - **Footer:** "Regenerate" (left); "Cancel" + **"Send to DocuSeal"** (right, DocuSeal blue).
- **Behavior (prototype):** calls the in-page Claude helper (`window.claude.complete`) with a prompt built from the motion title, details, and linked meeting, asking for a formal governance instrument (resolution/consent) with recitals, operative clauses, an effective date, and a 7-director signature block; on failure it falls back to an editable stub. **"Send to DocuSeal"** creates a new custom document (category Governance, status "sent"), links it to the motion (`docId`), opens the DocuSeal modal, and it now appears in Documents. **Production:** call your server-side LLM endpoint (don't expose keys client-side); store the generated document; create the DocuSeal submission.

### 10. Team & Access
- **Purpose:** create and manage board-member logins and permissions. **This is an admin/IT function — handled by IT support, not Alitalia day-to-day.** In production, restrict this screen to an IT/admin role; it is intentionally left out of the board member guide.
- **Header:** title + **"Add member"** button.
- **Info banner** (`--accent-soft`): explains members sign in with a **username & password** (no foundation email needed), their **personal email** is where DocuSeal sends documents, and Vote vs. admin rights.
- **Hostinger email connection card:** *Disconnected* — a card with a purple "h" tile, "Connect foundation email to send documents", and a **"Connect Hostinger"** button. *Connected* — a `--good` card ("Hostinger email connected · Sending as admin@adamsinfinitelegacy.org via Hostinger") + Disconnect. Mirrors the Google Calendar connect pattern.
- **Member table:** columns `minmax(0,1fr) 150px 150px 120px` = Member / Login status / Permissions / Manage.
  - **Member cell:** avatar (colored by status — active `--accent`, invited `--warn`, none `--muted`), name (+ "You" chip), and a login line "@username · personal@email".
  - **Login status badge:** *Active* (`--good`), *Invited* (`--warn`), *No login* (neutral).
  - **Permissions:** "Vote" / "Sign" pills (or "—").
  - **Manage** button → opens the Manage Access modal.

### 11. Manage Access Modal (overlay)
- **Purpose:** edit one member's login + permissions (also used for "Add member").
- **Structure:** centered card (max-width `500px`).
  - **Header:** member avatar + name + role.
  - **Body:** **Username** input (used to sign in, monospace); **Personal email** input (where DocuSeal documents are sent); **Temporary password** input + a **"Generate"** button (random 10-char) with a "share privately / change on first sign-in" note; a **Permissions** group of two toggle rows — **Vote on motions** and **Sign documents** (checkbox tiles).
  - **Footer:** "Revoke access" (left, `--danger`, hidden for Alitalia and members with no login); "Cancel" + a primary **"Send invite"** (new member) / **"Save changes"** (existing).
- **Behavior (prototype):** saving writes to the local `accounts` map (new members become "invited"); revoke deletes the entry; toasts confirm. **Production:** create/update the user record + credentials; send the invite via the connected mailbox; enforce that only an admin can open this screen.

### 12. Email Preview Modal (overlay)
- **Purpose:** show the exact notification board members receive when a motion is posted for a vote.
- **Trigger:** "Preview email" on a motion card.
- **Structure:** centered card styled like an email client — a **From / To / Subject** header block, then the message body: an intro, **"You are voting on"** with the motion title + full description, the **discussion meeting** date/time, a **"Join the Zoom discussion"** link, a **live vote-results block** (result badge — *Passed* / *Failed* / *Voting open*; a segmented For/Against/Abstain bar; and an "X of N directors have voted" line), and a primary **"Review & vote in the portal"** button (the official vote is cast in the portal, not on Zoom).
- **Recipient line:** lists every board member with vote access (first names + "you").
- **Behavior (prototype):** read-only preview. **Production:** render this as the real HTML email template sent through the connected Hostinger mailbox; the results block reflects the tally at send time (or use it as a post-vote "results" email).

## Interactions & Behavior
- **Nav:** click switches `screen` state; no full page reload.
- **Toasts:** bottom-center pill (`--ink` bg / `--bg` text), auto-dismiss ~2.2s (used for sign/remind/connect actions).
- **Modal:** click backdrop or Close/X to dismiss; inner card stops propagation.
- **Autosave:** notes save on change (debounced).
- **Entry motion:** subtle; avoid animations that leave content at `opacity:0` if they don't run.
- **Persistence (prototype only):** everything is stored in `localStorage` under a versioned key. Replace with real APIs.

## State Management
Core state: `loggedIn`, current `screen`, `search`, `sig` (per-document map of `{memberId: true}`), `tasks` (map of `{taskId: true}`), `notes[]` + `activeNoteId`, `calConnected`, `zoomConnected`, `emailConnected` (Hostinger), `modal` (open doc id), `motions[]` (each `{id, title, desc, meeting, created, votes:{memberId:'for'|'against'|'abstain'}, docId?, zoomUrl?, voteDay?, voteTime?, notifiedAt?, notifiedCount?}`), `draft` (new-motion form), `drafting` (AI draft modal), `emailPreview` (open motion id for the Email Preview modal), `accounts` (per-member `{username, email, status, vote, sign}`), `extraMembers[]`, `customDocs[]`, `acct` (Manage Access form), `toast`. A `roster()` helper = seeded members + `extraMembers`; an `allMeetings()` helper merges the seeded `MEETINGS` with motion-generated vote meetings (unlinked motions add a new calendar entry; linked ones reuse the existing meeting) and feeds the calendar + dashboard.
Derived: document status (draft → sent/awaiting → fully signed) is computed from how many roster members have signed; launch progress = done/total tasks; motion result from the vote tally.
Data fetching (production): auth session + role; documents + signature status (incl. DocuSeal webhooks); calendar events (Google API); notes CRUD; motions + votes; board-member accounts; LLM draft endpoint; outbound email (Hostinger).

## Design Tokens
**Fonts:** headings/brand = **Spectral** (serif, 500/600); UI/body = **Public Sans** (400/500/600/700). (Google Fonts.)

**Theme = CSS custom properties** (3 selectable palettes; `premium` is default):

*Premium (default):* `--bg:#f4f3ee` · `--panel:#ffffff` · `--ink:#282820` · `--muted:#79776d` · `--line:#e7e4db` · `--accent:#5f7856` · `--accent-soft:#e9efe4` · `--brand:#41533a` · `--danger:#b4553f` · `--warn:#a9762f` · `--warn-soft:#f4ebd6` · `--good:#4f7a4a` · `--good-soft:#e6efe4`

*Warm:* `--bg:#faf4ed` · `--panel:#fffdf9` · `--ink:#332b24` · `--muted:#8b8074` · `--line:#efe5d8` · `--accent:#c17a52` · `--accent-soft:#f6e8dc` · `--brand:#a15c39` (danger/warn/good as premium; `--good:#6a8a52`, `--good-soft:#ecefdf`, `--warn-soft:#f6ead4`)

*Clinical:* `--bg:#eef4f8` · `--panel:#ffffff` · `--ink:#122636` · `--muted:#65809a` · `--line:#dde8ef` · `--accent:#2f7f93` · `--accent-soft:#dcedf1` · `--brand:#1d5f70` · `--danger:#c15b48` · `--good:#2f8a6a` · `--good-soft:#dcefe6` · `--warn-soft:#f4ead4`

**DocuSeal blue:** `#1a73e8`. **Signed green (docs):** `#34A853` accents in the signature field.

**Radii:** inputs/buttons `9–10px`; cards `13–16px`; pills/badges `20px`; avatars `50%`. **Borders:** `1px solid --line`. **Shadows:** soft — cards use subtle `rgba(0,0,0,.06)`; modal `0 30px 80px rgba(0,0,0,.3)`. **Spacing:** 4px-ish scale; card padding `16–22px`; main padding `28–30px`.

**Tweakable options (surface as settings/theme switches):** `theme` (premium | warm | clinical) and `dashboardLayout` (Overview grid | Two-column feed).

## Domain Data (for seeding / models)
- **Board members (7 — all must sign):** Alitalia Adams (President & Founder), Judy Adams (Vice Chair), Lee Taylor II (Treasurer/CFO), Courtney Woo (Secretary), Charles Pleasant (CIO), Joe Grumbine (Community Health Education Chair), Nancy Hughes (Philanthropy Chair). Additional members can be added at runtime (Team & Access → Add member) and become full roster members.
- **Accounts (login model):** each member has `{username, email (personal), status, vote, sign}`. Seed: Alitalia `active` with `vote`+`sign` (admin); the other six `active`, `vote` only, `sign:false`. Usernames like `judy.adams`; personal emails are ordinary consumer addresses (gmail/outlook/yahoo) — **not** foundation emails. Login accepts username or email.
- **Documents (12 seeded + AI-generated):** Bylaws (Governance); Organizational Board Minutes (Governance); Board Resolution & Written Consent (Governance); Board Action & Vote (Governance); **Board Resolution — Festival & Sponsorship (Governance)**; Sponsorship Prospectus (Fundraising); **Sponsorship Agreement (per sponsor) (Fundraising)**; Sponsor Acknowledgment Letter (Fundraising); four Donor Letters (Donor Letters). The two bold entries are the newly-added board-approved templates — a signed PDF of each is in `source_documents/` (`Board Resolution - Festival & Sponsorship.pdf`, `Sponsorship Agreement (per sponsor).pdf`). Both route to DocuSeal for all board signers; the Sponsorship Agreement also has sponsor + officer signature blocks.ip Prospectus — Get Well Soon Festival (Fundraising); Sponsor Acknowledgment Letter (Fundraising); Donor Letter — Cash Gift / In-Kind Gift / Quid Pro Quo / Year-End Summary (Donor Letters). Each has a plain-language description + a "what to do" instruction (see the prototype's `DOC_INFO`). AI-drafted documents from motions are appended to the library (`customDocs`) and carry their own description/body.
- **Motions:** each `{title, desc, meeting?, votes, docId?}`; seed one example ("Adopt the Bylaws…") with a couple of votes cast.
- **Integrations:** Google Calendar (meetings) and **Hostinger email** (outbound DocuSeal invitations/reminders) — both mocked as connect toggles in the prototype.
- Source documents these are based on are the client's uploaded `.docx`/`.pdf` files (bylaws, minutes, donor letters, prospectus, board resolutions).

## Assets
- **Fonts:** Google Fonts — Spectral, Public Sans.
- **Icons:** simple inline stroke SVGs (dashboard/grid, document, checklist, calendar, note, search, logout, plus, trash, close, info, check). The **Google "G"** logo (multicolor) is used on the calendar connect button. No raster image assets; no logo file yet — use a real brand logo when available.
- No external image dependencies.

## Files
- `Adams Infinite Legacy Portal.dc.html` — the full design prototype (all screens, states, copy, tokens, and seed data). Open it in a browser to see every screen and interaction.
- `support.js` — the prototype-only runtime (for viewing the HTML). **Do not port to production.**
- `screenshots/` — reference PNGs of each finished screen (desktop): `01-login`, `02-dashboard`, `03-documents`, `04-checklist`, `05-votes`, `06-email` (motion notification email preview), `07-calendar`, `08-notes`. Use these as the visual target when recreating the UI.
- `source_documents/` — the **real foundation documents** these features are built around. These are the actual files that will be uploaded to DocuSeal, mapped to checklist tasks, and shown in the Documents list. Use them to verify document titles, signer requirements, and content. Contents:
  - `01_Organizational_Board_Minutes.docx` — the organizational board minutes; the **27 checklist tasks derive from its resolutions**.
  - `Adams_Infinite_Legacy_Bylaws.docx` + `Adams_Infinite_Legacy_Bylaws_DocuSeal_Upload.pdf` — the bylaws (editable + the DocuSeal-ready PDF with signature fields).
  - `11_Board_Resolution_and_Authorization.docx` — banking/credit authorization resolution (**all board members sign**).
  - `12_Board_Action_and_Vote.docx` — general board action & vote record.
  - `09_Sponsorship_Prospectus.docx` + `10_Sponsor_Acknowledgment_Letter.docx` — fundraising: sponsorship tiers/prices and the sponsor thank-you letter.
  - `07a`–`07d` donor letter templates — cash gift, in-kind gift, quid pro quo, and year-end summary acknowledgments.
  - `Foundation_Launch_Checklist_Ordered.docx` — the **canonical checklist order** (5 sequential stages) the portal must follow.
  - `Foundation Launch Checklist (portal export).docx` — the same 27 steps with the portal's plain-language instructions.
  - `How to Use Your Portal.docx` — the end-user guide (useful for in-app help copy and tooltips).
  - **Board-approved templates (branded, DocuSeal-ready, built as `doc-page` DCs — open in a browser, print to PDF, or upload to DocuSeal):**
    - `Board Resolution — Festival & Sponsorship.dc.html` — resolution establishing the Get Well Soon Festival + sponsorship program; vote record + all 7 director signature blocks.
    - `Sponsorship Agreement (per sponsor).dc.html` — the per-sponsor agreement (sponsor details, tiers **without preset prices**, terms), a "what each level means" reference page, and a board-approval page (vote record + 7 director signatures + sponsor/officer signatures).
    - `Sponsorship Prospectus — Get Well Soon Festival.dc.html` — the outward-facing sponsor pitch (cover, mission, tiers, commitment form).
    - `Motion 1 — Director Meeting Fee.dc.html` — amends the no-compensation resolution, sets a $200/meeting director fee (all directors vote).
    - `Motion 2 — President Compensation.dc.html` — approves Alitalia's salary; **Alitalia recused**, disinterested directors sign.
    - `Motion 3 — Arrangement with Nancy Hughes.dc.html` — approves a compensated arrangement with Nancy; **Nancy recused**, disinterested directors sign.
    - `doc-page.js` — the paged-document runtime these templates depend on.
    - These represent additional documents/motions the portal should support: each is routed to DocuSeal for the required signers, and the three Motions correspond to Board Votes that, once passed, produce the signable instrument. Recusal (interested director does not vote/sign) must be enforced for Motions 2 & 3.

## Production Integration Checklist
1. **Auth & roles:** real login accepting username **or** email + password, sessions, ideally 2FA. Two roles — **admin/IT** (full access) and **board member** (vote-only by default). Gate nav, screens, and actions by role + `vote`/`sign` permissions.
2. **DocuSeal:** create submissions with all roster board signers per document; embed signing or use hosted URLs; sync status via webhooks; map to Draft / Awaiting signatures / Fully signed.
3. **Board votes:** persist motions + per-director votes; compute results server-side; only members with `vote` may cast their own vote. On motion creation, generate a Zoom meeting + calendar event and send the email notification (with the vote link and results block) to voting members. Notifications are **email-only** — no SMS.
4. **AI drafting:** move `window.claude.complete` to a server-side LLM endpoint (never expose keys client-side); store generated documents; then create the DocuSeal submission.
5. **Google Calendar:** OAuth + Calendar API for connect/read/create events.
6. **Hostinger email:** connect the foundation mailbox (SMTP/API) so DocuSeal invitations and reminders send to members' personal emails from the foundation address.
7. **Team & Access:** admin/IT-only. Create board-member accounts (username + password), store each member's personal email, set `vote`/`sign` permissions, invite/revoke. Not exposed to board members.
8. **Persistence:** move checklist, notes, document/signature status, motions/votes, accounts, and integration connections from `localStorage` to a real backend, scoped per user/org.
9. Keep the checklist and signatures starting **empty** (clean slate) for a new organization.
