# Adams Infinite Legacy — Founder & Board Portal (production codebase)

Production recreation of the design handoff in [`../portal-handoff/`](../portal-handoff/) —
see that folder's README for the full product spec. Built with **React 18 + TypeScript + Vite**.

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production bundle in dist/
npm run preview   # serve the production build
```

**Demo login:** any board member's username (`alitalia`, `judy.adams`, `lee.taylor`, …) or
personal email, with any password. Unknown identifiers are rejected. `alitalia` is the
admin; everyone else is a vote-only board member.

## What's implemented

Every screen and flow from the handoff, with role gating the prototype deferred:

- **Login** — username *or* email; resolves against the accounts store; per-user session persisted.
- **Dashboard** — greeting (by signed-in user), launch-progress ring, 4 KPIs, checklist snapshot, recent documents, upcoming meetings. Both layout options (`Overview grid` / `Two-column feed`).
- **Documents** — category tabs, search (top bar), status derivation (Draft → Awaiting signatures → Fully signed), DocuSeal modal per document.
- **Launch Checklist** — 27 steps across 5 sequential stages with plain-language help text (`TASK_HELP`), linked documents, per-stage progress.
- **Board Votes** — motion cards with segmented tally, majority result logic, per-director rows; creating a motion generates a Zoom meeting, calendar event, and board email (via service seams); email preview modal; **AI draft modal** → editable draft → send to DocuSeal.
- **Calendar** — Google-connect empty state, July 2026 month grid, "This month" rail, Zoom connect/join.
- **Notes** — list + editor with 600 ms-debounced autosave indicator.
- **Team & Access** — Hostinger connect card, member table, Manage Access modal (username / personal email / temp password generator / Vote & Sign permission tiles / revoke).
- **Role gating** — admins see everything; board members get no Team & Access nav, no motion create/delete/draft, no bulk signing controls, and can cast **only their own** vote (enforced in the store, not just hidden in the UI).
- Clean slate per the production checklist: no tasks done, no signatures, no notes, no motions on first run.

## Architecture

```
src/
  data/seed.ts        # domain data from the handoff (members, docs, phases, help text, meetings)
  types.ts            # all domain + state types
  services/index.ts   # INTEGRATION SEAMS — interfaces + mock impls (see below)
  state/store.tsx     # single store: state, persistence, every action
  styles/global.css   # keyframes, responsive rules, hover/focus classes (ported 1:1)
  styles/theme.ts     # the 3 palettes as CSS custom properties
  lib/sx.ts           # CSS-string → style-object helper (see "Styling" below)
  components/         # Shell (sidebar+header), icons, shared primitives
  screens/            # one file per screen
  modals/Modals.tsx   # DocuSeal, AI draft, New motion, Manage access, Email preview
```

### Styling — why not Tailwind

The handoff specifies every element as inline CSS on top of theme custom properties, and
declares the visuals final ("High-fidelity … recreate the UI faithfully"). Keeping the
declarations verbatim through `sx()` makes the implementation diffable against the design
reference line-by-line and avoids translation drift. Swapping to Tailwind later is purely
mechanical if the team prefers it; the tokens are already CSS custom properties.

### Integration seams (`src/services/index.ts`)

The UI depends only on these interfaces; mocks reproduce the prototype's behavior:

| Interface | Production wiring |
| --- | --- |
| `AuthService` | Real credentials + sessions (ideally 2FA); role comes from the account record |
| `SignatureService` | DocuSeal submissions per document + signer roster; status via webhooks |
| `CalendarService` | Google OAuth + Calendar API (read/create events) |
| `ZoomService` | Zoom API meeting creation for vote discussions |
| `MailService` | Hostinger mailbox (SMTP/API) for vote requests & signing reminders — email-only by design, no SMS |
| `DraftService` | Server-side LLM endpoint (never expose keys client-side); the mock returns a deterministic resolution skeleton |

Persistence currently lives in `localStorage` (`ail_portal_prod_v1`) behind the store's
persist effect — replace with API calls per user/org. Notes are stored globally; scope
them per-user server-side when the backend lands.

## Verification

`npm run build` is clean, and the app is exercised end-to-end headlessly (login → checklist
→ DocuSeal signing → motion → vote → AI draft → team; then board-member login → role
gating → persistence across reload): 25/25 checks pass. The harness lives in the session
scratchpad (`verify-portal.js`); port it into CI as a Playwright test when the repo gets one.

## Outstanding for production

1. Real backend for auth/sessions and all seams above (webhooks for DocuSeal status).
2. Per-user notes scoping; server-side result computation for votes.
3. Recusal enforcement for interested-director motions (see handoff `source_documents/Motion 2/3`) — the data model supports it via per-motion voter exclusion; wire it when those motion types are added.
4. "Change password on first sign-in" flow for invited members.
