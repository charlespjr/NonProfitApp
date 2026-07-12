module.exports = {
  num: 12,
  slug: 'tracking-signature-status',
  title: 'Tracking Signature Status',
  next: 'Creating a Motion',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Who's signed — and who hasn't? The portal answers that everywhere you look. Let's start on the Dashboard.`,
    `The Awaiting signature card counts documents still out with the board. One, right now. Let's click Documents to see which one.`,
    `In the library, read the Status column. The Bylaws say Awaiting signatures — and right underneath, in small print: three of seven board members signed.`,
    `Open the document for the full picture: a progress bar, and a green Signed check beside every name that's already done.`,
    `For anyone still pending, the Remind button sends a friendly nudge — just to them. No group guilt-trips required.`,
    `And when everyone's in, the badge turns green — Fully signed — like our Organizational Board Minutes here. Nothing left to chase. Next up: creating a motion.`,
  ],
  overlays: [
    { text: 'Status, everywhere', p: 1 },
    { text: '3 of 7 signed', p: 3 },
    { text: 'Remind — one person only', p: 5 },
    { text: 'Green means done', p: 6 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.0)
    await a.hover('text=Good ', 700)
    await a.at(a.p(2) + 0.4)
    await a.hover('text=Awaiting signature', 800)
    await a.sleep(2000)
    await a.click('text="Documents"')
    await a.at(a.p(3) + 0.5)
    await a.hover('text=Awaiting signatures', 800)
    await a.sleep(1600)
    await a.hover('text=3 of 7 board members signed', 900)
    await a.at(a.p(4) + 0.5)
    await a.click('button:has-text("Open in DocuSeal")')
    await a.sleep(900)
    await a.hover('text=Signers · full board required', 800)
    await a.sleep(1200)
    await a.hover('text=Signed', 700)
    await a.at(a.p(5) + 0.6)
    await a.hover('button:has-text("Remind")', 900)
    await a.at(a.p(6) + 0.6)
    await a.backdrop()
    await a.sleep(500)
    await a.hover('text=Fully signed', 800)
    await a.sleep(1200)
    await a.hover('text=Organizational Board Minutes', 800)
    await a.move(900, 520, 900)
  },
}
