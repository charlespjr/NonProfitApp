module.exports = {
  num: 11,
  slug: 'signing-with-docuseal',
  title: 'Signing with DocuSeal',
  next: 'Tracking Signature Status',
  // Alitalia is the unsigned one, so her own row carries the "Sign now" button.
  seed: {
    sig: {
      minutes: { alitalia: true, judy: true, lee: true, courtney: true, charles: true, joe: true, nancy: true },
      bylaws: { judy: true, lee: true, courtney: true },
    },
  },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Signing paperwork used to mean printing, scanning, and chasing people down. In your portal, it's a click. Let's sign the Bylaws together.`,
    `Open Documents... find the Bylaws of Adams Infinite Legacy... and click Open in DocuSeal.`,
    `Welcome to the signing room. Up top, the document itself. Below, the signer list — the whole board — with a green Signed check for everyone who's done. We're at three of seven.`,
    `When it's your turn, there's a Sign now button next to your name. Click it... and that's it. Your signature is recorded, dated, and counted — four of seven now.`,
    `Need a nudge? Remind sends a gentle email to one person. Or click Email board to sign, and everyone still pending hears from you at once.`,
    `When the last signature lands, the status flips to Fully signed, and the document files itself in the library. Speaking of tracking — that's our next video.`,
  ],
  overlays: [
    { text: 'No printer required', p: 1 },
    { text: 'The signing room', p: 3 },
    { text: 'Click Sign now', p: 4 },
    { text: 'Remind — a gentle nudge', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(2) + 0.4)
    await a.click('text="Documents"')
    await a.sleep(900)
    await a.hover('text=Bylaws of Adams Infinite Legacy', 800)
    await a.sleep(900)
    await a.click('button:has-text("Open in DocuSeal")')
    await a.at(a.p(3) + 0.6)
    await a.hover('text=Signers · full board required', 800)
    await a.sleep(1500)
    await a.hover('text=signatures collected', 800)
    await a.at(a.p(4) + 1.1)
    await a.click('button:has-text("Sign now")')
    await a.sleep(1000)
    await a.hover('text=signatures collected', 800)
    await a.at(a.p(5) + 0.5)
    await a.hover('button:has-text("Remind")', 800)
    await a.sleep(1600)
    await a.hover('button:has-text("Email board to sign")', 800)
    await a.at(a.p(6) + 0.8)
    await a.backdrop()
    await a.sleep(600)
    await a.hover('text=Fully signed', 900)
    await a.move(900, 520, 900)
  },
}
