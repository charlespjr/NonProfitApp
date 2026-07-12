module.exports = {
  num: 20,
  slug: 'managing-team-and-access',
  title: 'Managing Team & Access (for IT)',
  next: null,
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Last stop: Team and Access — the admin room. If you're the techie of the board, this corner is yours, and it's refreshingly small.`,
    `Open Team and Access from the menu. Here's the whole board on one table: each member, their login status, and their permissions at a glance.`,
    `Click Manage next to a member to open their access card. You set their username, and their personal email — that's where DocuSeal deliveries go.`,
    `For the password, click Generate — you get a strong temporary one to share privately. They'll be asked to change it the first time they sign in.`,
    `These two tiles are the real controls: Vote on motions, and Sign documents. Click to grant or remove either one — the portal enforces them everywhere, automatically.`,
    `And if someone leaves the board, Revoke access closes the door instantly. Their history stays; their key stops working.`,
    `One more admin chore lives on this page: connecting the foundation's own email address, so vote requests and reminders go out from your domain, not a stranger's.`,
    `And that's the full tour — twenty short videos, one launched foundation. Thanks for building something good.`,
  ],
  overlays: [
    { text: 'The admin room', p: 1 },
    { text: 'Manage — one member', p: 3 },
    { text: 'Generate a temp password', p: 4 },
    { text: 'Vote · Sign — the two keys', p: 5 },
    { text: 'Revoke, instantly', p: 6 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.4)
    await a.click('text="Team & Access"')
    await a.at(a.p(2) + 0.8)
    await a.hover('text=Judy Adams', 800)
    await a.sleep(1400)
    await a.hover('text=Lee Taylor II', 800)
    await a.at(a.p(3) + 0.5)
    const manage = a.page.locator('button:has-text("Manage")').nth(1)
    const b = await manage.boundingBox().catch(() => null)
    if (b) {
      await a.move(b.x + b.width / 2, b.y + b.height / 2, 700)
      await a.page.mouse.down(); await a.sleep(90); await a.page.mouse.up()
    }
    await a.sleep(900)
    await a.hover('input[placeholder="e.g. judy.adams"]', 700)
    await a.sleep(1100)
    await a.hover('input[placeholder="their personal email address"]', 700)
    await a.at(a.p(4) + 0.8)
    await a.click('button:has-text("Generate")')
    await a.sleep(1200)
    await a.hover('text=Share this with the member privately', 800)
    await a.at(a.p(5) + 0.6)
    await a.hover('text=Vote on motions', 800)
    await a.sleep(1600)
    await a.hover('text=Sign documents', 800)
    await a.at(a.p(6) + 0.6)
    await a.hover('button:has-text("Revoke access")', 900)
    await a.at(a.p(7) + 0.6)
    await a.backdrop()
    await a.sleep(600)
    await a.hover('text=Connect your foundation email', 900)
    await a.at(a.p(8) + 1.0)
    await a.hover('text=Team & Access', 800)
    await a.move(900, 500, 1100)
  },
}
