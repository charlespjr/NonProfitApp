# Quorum Portal — multi-tenant SaaS (frontend + backend)

Production recreation of the design handoff in [`../portal-handoff/`](../portal-handoff/) —
see that folder's README for the full product spec — extended into a **multi-tenant SaaS**:
nonprofit organizations register, invite their board, and (once Stripe is configured)
pay for a subscription. **React 18 + TypeScript + Vite** frontend, **Hono** API,
**Postgres** via Drizzle.

```bash
npm install
npm run build       # typecheck (app + server) + production bundle in dist/
npm run serve       # API + built SPA at http://localhost:3000 (embedded PGlite DB)
npm run dev         # frontend-only dev server (demo mode)
npm run test:server # 30 API tests on an embedded database — no setup needed
```

## Two modes, one build

At boot the app probes `/api/health`:

- **api mode** (backend present): real registration ("Create your foundation"),
  real login, per-org server-persisted state, member invitations with temp
  passwords (forced change on first login), Stripe billing.
- **demo mode** (static hosting, e.g. the current quorum-board-os deploy): the
  original single-org AIL demo with seeded accounts and localStorage.

## Launch runbook (SaaS on Vercel)

1. **Vercel Pro** — commercial use requires it ($20/mo).
2. **Postgres** — create a database (Vercel Marketplace → Neon, or Supabase).
   Copy the connection string.
3. **New Vercel project** from this repo, Root Directory `portal` (vercel.json
   supplies build command, output dir, and the /api rewrite).
4. **Environment variables**:
   - `DATABASE_URL` — the Postgres connection string
   - `JWT_SECRET` — long random string (e.g. `openssl rand -hex 32`)
   - `APP_URL` — e.g. `https://app.quorumboardos.com`
   - Payments via QuickBooks payment links (current mode): `PAYLINK_STARTER_M`,
     `PAYLINK_STARTER_Y`, `PAYLINK_GROWTH_M`, `PAYLINK_GROWTH_Y`,
     `PAYLINK_SCALE_M`, `PAYLINK_SCALE_Y` — each a QuickBooks Payments
     multi-use share link — plus `ADMIN_KEY` (long random string) for the
     manual plan-activation endpoint. Payment links have no webhook, so after
     a payment lands in QuickBooks, activate the org's plan with:
     `curl -X POST <APP_URL>/api/billing/activate -H "x-admin-key: $ADMIN_KEY" \
        -H "content-type: application/json" -d '{"orgId":"org_…","plan":"growth"}'`
   - Stripe (optional, takes precedence when set): `STRIPE_SECRET_KEY`,
     `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_LAUNCH`
5. **Stripe** — create products "Quorum Growth" (monthly) and "Quorum Launch
   Partner" (one-time); add a webhook to `<APP_URL>/api/billing/webhook` for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Until these vars exist, upgrade buttons
   show a graceful "billing not configured" message — everything else works.
6. **Domain** — point `app.<yourdomain>` at the project; keep the marketing
   site at the apex.

## Tenancy & security model

- `orgs` / `users` / `org_state` tables; every request is scoped to the
  session's org (JWT HttpOnly cookie, bcrypt passwords, 14-day sessions).
- Usernames/emails are unique **per org**; the same username in two orgs is
  disambiguated at login by password.
- Admin-only: member management, motion create/delete, AI drafting, billing.
  Members cast only their own vote — enforced server-side by role and
  client-side in the store.
- Board state syncs as a versioned JSONB document per org (optimistic
  concurrency; on conflict the server copy wins). Normalize pieces out of it
  when a feature needs cross-org queries.

**Demo login (static hosting only):** any seeded username (`alitalia`,
`judy.adams`, …) with any password; `alitalia` is the admin.

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
