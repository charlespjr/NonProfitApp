# Prompt: produce a Quorum tutorial video (paste this into a Claude session)

You are producing screen-recorded tutorial videos for Quorum, the nonprofit board portal
in this repository. A complete, working production studio already exists in
`tools/video-studio/` — do not rebuild it; read `lib.js` once and reuse it.

## How the studio works (read this before touching anything)

One command produces a finished video: `node produce.js <specnumber>` (run from the
studio directory, e.g. `node produce.js 04`). It does four things:

1. **Voiceover first.** Each narration paragraph in the spec is synthesized separately
   with edge-tts (voice `en-US-JennyNeural`, rate -4%), then concatenated with 0.55s
   gaps. Because each paragraph is a separate file, the exact start time of every
   paragraph is computed, not guessed — the whole recording is choreographed against
   those timestamps.
2. **Recording.** Playwright drives the portal (`npm run dev` in `portal/`, demo mode,
   http://localhost:5173) at 1920x1080 with recordVideo. The library injects a visible
   cursor with click ripples, hides the demo-mode hint box, and adds a 3px rotating
   keep-alive pixel — without it Playwright silently drops static frames and the
   timeline compresses. The action clock starts only after the app renders (the app's
   boot health-probe can delay first paint ~10s), and the elapsed time is written to
   meta.json so assembly trims the recording head precisely.
3. **Assembly.** ffmpeg trims the head, overlays branded intro/outro cards (rendered
   from HTML via Chromium), burns 3-5 terracotta text overlays with fades, muxes the
   narration, and writes `out/<slug>.mp4` plus a `.vtt` caption file cut per paragraph.
4. **Output** goes to `out/`; copy the mp4+vtt into `quorum/videos/` and commit.

## Environment setup (once per session)

- `cd portal && npm install && npm run dev` (leave running; demo mode needs no backend)
- `apt-get install -y ffmpeg` (Playwright's bundled ffmpeg lacks H.264)
- `pip install edge-tts`, and append the proxy CA so TLS works:
  `cat /root/.ccr/ca-bundle.crt >> $(python3 -c "import certifi; print(certifi.where())")`
- `cd tools/video-studio && npm init -y && npm install playwright-core`
  (Chromium is preinstalled at /opt/pw-browsers/chromium — never `playwright install`)

## Writing a new spec (the only real work)

Copy an existing spec in `specs/` (04 and 11 are good models) and edit. A spec is:

- `num`, `slug`, `title`, `next` (outro card points to the next video; `null` = series end)
- `seed` — overrides for the demo org's localStorage state (base state in lib.js:
  8/27 tasks done, bylaws 3-of-7 signed, calendar+zoom connected, signed in as the
  founder). Seed `sessionUserId: null` to start at the login page, `'judy'` for the
  board-member view, `motions: [...]` for vote screens.
- `paragraphs` — the narration. Rules: warm, plain-language, first person plural,
  short sentences; paragraph 0 is always "Quorum — the Nonprofit Board OS." (plays
  over the intro card); the last paragraph should end by naming the next video.
  ~950-1200 characters total ≈ 65-100 seconds.
- `overlays` — 3-5 short phrases, each anchored to a paragraph index `p`.
- `actions: async a => {...}` — the choreography. `a.p(i)` = paragraph i's start time;
  `await a.at(sec)` waits until that moment. Helpers: `clickNav(label)`, `click(sel)`,
  `hover(sel)` (auto-scrolls offscreen targets), `type(sel, text)`, `scrollTo(sel)`,
  `wheel(dy, times)`, `backdrop()` (closes any modal), `move(x, y)`. Selectors are
  Playwright syntax; sidebar items match `text="Documents"` exactly (case-sensitive).
  Land each click ~0.3-0.5s before its narration line mentions it.

## Verification (do not skip)

Extract 2-3 stills at paragraph boundaries and LOOK at them:
`ffmpeg -ss <t> -i out/<slug>.mp4 -frames:v 1 chk.png` — confirm the right screen is
visible when the narration talks about it, overlays appear, and no demo hint box shows.
If an action missed (console prints `MISS <selector>`), fix the selector and rerun —
the voiceover is cached, so reruns cost only the recording time.

## House style

Number tutorials in title and outro. Keep every step one idea. Always say where to
click. No music. Captions ship with every video. Existing library and naming:
see `marketing/tutorials/README.md`.
