# Quorum — marketing site

Landing page for **Quorum — The Nonprofit Board OS** ("Every board decision,
document, and deadline — in one place"), the productized version of the Adams
Infinite Legacy board portal. Design matches the Quorum one-pager: espresso +
terracotta + cream, JetBrains Mono kickers, Form · Sign · Vote · Meet · Comply.

Static site: a single `index.html` (inline CSS, no build step). Product
screenshots (warm-theme, captured from the live product) are in `shots/` and
are currently ALSO served from https://portal.adamsinfinitelegacy.org/lmb/ —
the deployed page references those absolute URLs; switch to relative `shots/`
paths once this repo hosts its own images. `preview.html` is the local-preview
copy using relative paths.

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
