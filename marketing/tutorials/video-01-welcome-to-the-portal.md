# Tutorial 1 — "Welcome to the Portal" (produced)

**Files:** `quorum/videos/welcome-to-the-portal.mp4` (74s, 1080p) + `welcome-to-the-portal.vtt` (captions)

- **One-line description:** A friendly first look at Quorum — the one private place where your foundation's launch, documents, votes, and meetings all live.
- **Length:** 74 seconds. **Voice:** "Bella" (warm, professional) via vidIQ voiceover.
- **Learning goal:** after this, the viewer can name the seven sections of the portal and explain what the portal is for.

## Narration (as recorded)

> Quorum — the Nonprofit Board OS.
>
> Welcome. This is Quorum — your board's private portal. It's the one place where everything about launching your foundation lives.
>
> Let's take a quick look around.
>
> When you sign in, you land on your Dashboard. It greets you by name, and shows, at a glance, how the launch is going.
>
> Down the left side is your menu. Everything in the portal lives here, in seven simple sections.
>
> Documents holds your bylaws, minutes, and letters — ready to sign online, no printer needed.
>
> The Launch Checklist walks you step by step, from "we have an idea" to "we're an official charity."
>
> Board Votes is where the board makes decisions — even between meetings.
>
> The Calendar keeps every board date in one place, with one-click video calls.
>
> Notes is your own private notebook.
>
> And Team & Access shows who's on the board, and who can sign.
>
> Here's the good news: you don't need to learn it all today. The portal always shows you the next step — and we'll walk through each section together, one short video at a time.
>
> Ready? Let's start with signing in.

## Shot list (as recorded, times = final video)

| Time | Narration | On screen |
|---|---|---|
| 0:00 | "Quorum — the Nonprofit Board OS." | Branded intro card (terracotta, Q mark) |
| 0:03 | "Welcome. This is Quorum…" | Sign-in page, held |
| 0:12 | "Let's take a quick look around." | Username/password typed on screen |
| 0:14 | "When you sign in, you land on your Dashboard…" | Click **Sign in** → Dashboard (greeting, KPI row, progress ring) |
| 0:22 | "Down the left side is your menu…" | Cursor sweeps all 7 sidebar items |
| 0:28 | "Documents holds your bylaws…" | Click **Documents**; hover Bylaws (Awaiting signatures) |
| 0:35 | "The Launch Checklist walks you step by step…" | Click **Launch Checklist**; slow scroll through Stage 2 |
| 0:42 | "Board Votes is where the board makes decisions…" | Click **Board Votes**; hover **+ New motion** |
| 0:46 | "The Calendar keeps every board date…" | Click **Calendar**; July grid + Join Zoom buttons |
| 0:52 | "Notes is your own private notebook." | Click **Notes**; hover **+ New note** |
| 0:54 | "And Team & Access shows who's on the board…" | Click **Team & Access**; roster |
| 0:59 | "Here's the good news…" | Back to **Dashboard**; rest on Launch checklist card |
| 1:09 | "Ready? Let's start with signing in." | Outro card: "Next up — Signing In & Getting the App" |

Text overlays: "Your board's private portal" (0:05), "Seven simple sections" (0:22), "Step by step" (0:35), "One place for everything" (0:60).

## Production pipeline (repeatable for tutorials 2–20)

1. **Portal**: `npm run dev` in `portal/` (demo mode). Seed `localStorage.ail_portal_prod_v1` for the mid-launch state (8/27 tasks, bylaws 3-of-7 signed, calendar+zoom connected).
2. **Voiceover first**: generate one MP3 per video (vidIQ voiceover, voice "Bella", ~14 credits/1000 chars); detect paragraph boundaries with `ffmpeg silencedetect` and snap proportional char positions to the longest pauses.
3. **Record**: Playwright + bundled Chromium, 1920×1080, `recordVideo`. Inject a visible cursor + click ripple, a 3px rotating keep-alive pixel (prevents Playwright from dropping static frames), and hide the demo hint box. Start the action clock only after the login form renders; write `meta.json` with elapsed seconds; head-trim = webm duration − elapsed.
4. **Assemble**: ffmpeg — trim head, 30fps, overlay intro/outro cards (HTML→PNG via Chromium), drawtext overlays with fades, mux narration, x264 CRF 19 + AAC.

Scripts live in the session scratchpad (`studio/`): `timeline.js`, `record.js`, `make-cards.js`, `filters.txt`.
