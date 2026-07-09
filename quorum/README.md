# Quorum — marketing site

Landing page for **Quorum — The Nonprofit Board OS** ("Every board decision,
document, and deadline — in one place"), the productized version of the Adams
Infinite Legacy board portal. Design matches the Quorum one-pager: espresso +
terracotta + cream, JetBrains Mono kickers, Form · Sign · Vote · Meet · Comply.

Static site: a single `index.html` (inline CSS, no build step). Product
screenshots (warm-theme, captured at 1920px from the portal prototype in
`../portal-handoff/`) are in `shots/` and are referenced by relative paths.
`preview.html` is kept byte-identical to `index.html`.

**Live:** https://quorum-board-os.vercel.app (Vercel project `quorum-board-os`,
team *pleasantc-gmailcom's projects*). The deployment's build step pulls
`index.html` + `shots/` from this repo's `main` branch, so redeploying the
project from the Vercel dashboard picks up whatever is on `main`. An older
deploy with pre-refresh content is also public at quorum-site.vercel.app — the
`quorum-site` and `quorum` Vercel projects are superseded and safe to delete.

## Editing

- **Waitlist form** posts via formsubmit.co → pleasantc@gmail.com. First
  submission triggers a one-time FormSubmit confirmation email — click it once.
- **Domains**: quorum.app / getquorum.com / usequorum.com / quorumboard.com /
  quorumhq.com are all TAKEN (checked via RDAP). Note: "Quorum" is a crowded
  name — quorum.us (public-affairs software) and GetQuorum (board/condo voting)
  are existing products. Consider a distinctive domain (e.g. quorumforgood.org,
  runquorum.com — unverified) and a trademark search before spending on brand.
- **Pricing** is founding-member placeholder pricing — validate before charging.

## History

Previously branded LaunchMyBoard (launchmyboard.com was available, $11.25/yr).
Rebrand = find-and-replace on "Quorum".

## Deploy

Any static host. Vercel: no build command, output = repo root.
