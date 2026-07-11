# Quorum tutorial video library (20 videos, produced)

All files live in [`quorum/videos/`](../../quorum/videos/) — each video ships as `slug.mp4`
(1920×1080, H.264 + AAC) with a matching `slug.vtt` caption track. Total runtime ≈ 26 minutes.

| # | Title | File (slug) | Length |
|---|---|---|---|
| 1 | Welcome to the Portal | `welcome-to-the-portal` | 1:14 |
| 2 | Signing In & Getting the App | `signing-in-getting-the-app` | 1:26 |
| 3 | A Tour of Your Dashboard | `dashboard-tour` | 1:38 |
| 4 | How the Launch Checklist Works | `how-the-launch-checklist-works` | 1:31 |
| 5 | Stage 1: Form the Corporation & Get Your Tax ID | `stage-1-form-the-corporation` | 1:09 |
| 6 | Stage 2: The Organizational Board Meeting | `stage-2-organizational-board-meeting` | 1:36 |
| 7 | Stage 3: Banking, Signatories & Insurance | `stage-3-banking-signatories-insurance` | 1:21 |
| 8 | Stage 4: Tax Exemption & Charitable Registration | `stage-4-tax-exemption-registration` | 1:38 |
| 9 | Stage 5: Ready to Raise Money | `stage-5-ready-to-raise-money` | 1:05 |
| 10 | Understanding Your Documents | `understanding-your-documents` | 1:19 |
| 11 | Signing with DocuSeal | `signing-with-docuseal` | 1:15 |
| 12 | Tracking Signature Status | `tracking-signature-status` | 1:08 |
| 13 | Creating a Motion | `creating-a-motion` | 1:13 |
| 14 | How Directors Vote | `how-directors-vote` | 1:11 |
| 15 | Reading Vote Results | `reading-vote-results` | 1:12 |
| 16 | Using the Calendar | `using-the-calendar` | 1:13 |
| 17 | Connecting Google Calendar & Zoom | `connecting-google-calendar-zoom` | 1:12 |
| 18 | Taking Notes | `taking-notes` | 1:05 |
| 19 | Board Member Quick Start | `board-member-quick-start` | 1:23 |
| 20 | Managing Team & Access (for IT) | `managing-team-and-access` | 1:29 |

Every video follows the same package: 3-second branded intro card → live portal screen
recording with a visible cursor and click ripples → 3–5 terracotta text overlays →
"Next up" outro card chaining to the next video (video 20 closes the series).
Each ends with a caption track (VTT) cut to the narration paragraphs.

## Voices

- Video 1: "Bella" (vidIQ / ElevenLabs premium voiceover).
- Videos 2–20: `en-US-JennyNeural` (edge-tts, free) — chosen so the series could be
  produced without exhausting the vidIQ credit balance. To re-dub video 1 with Jenny
  for perfect consistency (or the reverse), regenerate with the studio below.

## How they were made (the "studio")

The production pipeline is fully scripted (session scratchpad `studio/`):

1. **Voiceover first** — each narration paragraph is synthesized separately, so
   paragraph start-times are computed exactly (no silence detection needed).
2. **Recording** — Playwright drives the live portal (demo mode, seeded org state per
   video) against those timestamps: injected visible cursor, click ripples, a keep-alive
   pixel so the screencast never drops static frames, and per-video choreography specs.
3. **Assembly** — ffmpeg trims the load-time head (measured, not guessed), overlays the
   branded intro/outro cards (HTML→PNG), burns the text overlays with fades, muxes the
   narration, and emits the VTT.

Per-video spec = ~60 lines of JS (script paragraphs + where to click). Producing a new
or updated video is one command: `node produce.js <nn>`.

## Publishing notes

- The marketing site's Videos page (`quorum/videos.html`) currently has player slots for
  the two marketing films only (`what-is-quorum.mp4`, `how-to-use-quorum.mp4`). Wiring a
  "Tutorials" section that lists these 20 files (with `<track>` captions) is a small
  follow-up if wanted.
- In-portal help: the obvious home is a "Help & videos" link that deep-links each screen
  to its tutorial (Dashboard → #3, Checklist → #4–9, Documents → #10–12, Votes → #13–15,
  Calendar → #16–17, Notes → #18, Team → #20, plus #19 in board-member invite emails).
