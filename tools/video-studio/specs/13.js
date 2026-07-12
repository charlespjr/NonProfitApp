module.exports = {
  num: 13,
  slug: 'creating-a-motion',
  title: 'Creating a Motion',
  next: 'How Directors Vote',
  seed: {
    emailConnected: true,
    emailProvider: 'Hostinger',
    emailAddress: 'alitalia@adamsinfinitelegacy.org',
  },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `When the board needs to decide something official — adopting a policy, authorizing the bank account — you put it to a vote. In the portal, that starts with a motion.`,
    `Open Board Votes from the menu... and click New motion.`,
    `Give it a clear title — let's approve the festival budget. Then describe exactly what the board is deciding, in a sentence or two. Plain words beat legal words.`,
    `Before you click create, read the little note at the bottom: creating this motion schedules a Zoom vote meeting, adds it to the calendar, and emails every director who can vote. One click, three jobs.`,
    `Ready? Click Create motion... and there it is. Live, with the tally at zero, a Join vote meeting link, and the email already on its way to the board.`,
    `Made a mistake? You can remove a motion and start over, or resend the email anytime. Next: what voting looks like for each director.`,
  ],
  overlays: [
    { text: 'Decisions start as motions', p: 1 },
    { text: 'Click New motion', p: 2 },
    { text: 'Plain words win', p: 3 },
    { text: 'One click, three jobs', p: 4 },
  ],
  actions: async a => {
    await a.at(a.p(2) + 0.4)
    await a.click('text="Board Votes"')
    await a.sleep(900)
    await a.click('button:has-text("New motion")')
    await a.at(a.p(3) + 0.5)
    await a.type('input[placeholder^="e.g. Adopt the Bylaws"]', 'Approve the 2026 Get Well Soon Festival budget', 45)
    await a.sleep(400)
    await a.type('textarea', 'Approve a total festival budget of $12,500 for venue, permits, and supplies, funded from sponsorships.', 24)
    await a.at(a.p(4) + 1.2)
    await a.hover('text=Creating this motion schedules', 900)
    await a.at(a.p(5) + 0.9)
    await a.click('button:has-text("Create motion")')
    await a.sleep(1200)
    await a.hover('text=Approve the 2026 Get Well Soon Festival budget', 800)
    await a.sleep(1200)
    await a.hover('text=Join vote meeting', 800)
    await a.at(a.p(6) + 0.7)
    await a.hover('button:has-text("Resend email")', 900)
    await a.move(900, 500, 1000)
  },
}
