module.exports = {
  num: 15,
  slug: 'reading-vote-results',
  title: 'Reading Vote Results',
  next: 'Using the Calendar',
  seed: {
    motions: [
      {
        id: 'mo-festival',
        title: 'Approve the Get Well Soon Wellness Festival',
        desc: 'Establish the Get Well Soon Wellness Festival as an official program of the foundation and approve the tiered sponsorship program.',
        meeting: '',
        created: 'Jul 3, 2026',
        votes: { alitalia: 'for', judy: 'for', lee: 'for', courtney: 'for', joe: 'for', nancy: 'against' },
        zoomUrl: 'https://zoom.us/j/86691234502',
        voteDay: 8,
        voteTime: '10:00 AM',
        notifiedAt: 'Jul 3, 2026',
        notifiedCount: 6,
      },
      {
        id: 'mo-bank',
        title: 'Authorize opening the corporate bank account',
        desc: 'Authorize the Treasurer to open the corporate bank account and designate authorized signatories per the Board Resolution.',
        meeting: '',
        created: 'Jul 9, 2026',
        votes: { alitalia: 'for', judy: 'for', lee: 'against' },
        zoomUrl: 'https://zoom.us/j/86691234503',
        voteDay: 16,
        voteTime: '4:00 PM',
        notifiedAt: 'Jul 9, 2026',
        notifiedCount: 6,
      },
    ],
  },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Two motions, two different stories. Let's learn to read vote results like a seasoned board secretary.`,
    `Every motion card carries a tally bar — green for For, red for Against, gray for Abstain — and under it, each director's vote, by name.`,
    `The math is simple majority. Seven directors sit on this board, so four For votes carry any motion.`,
    `The festival motion counted five For, one Against. That's a majority — the card says Passed, in green. The decision is final, and this card is the record of it.`,
    `The bank account motion sits at three For, one Against. No result badge yet — it's still open, waiting on three directors. You can already see it leaning.`,
    `And when a passed vote needs a paper trail, the Board Action and Vote document in your library turns it into a signed record. Next: keeping every board date straight, with the Calendar.`,
  ],
  overlays: [
    { text: 'Green · Red · Gray', p: 2 },
    { text: '4 of 7 = majority', p: 3 },
    { text: 'Passed — on the record', p: 4 },
    { text: 'Still open', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 0.8)
    await a.click('text="Board Votes"')
    await a.sleep(800)
    await a.hover('text=Approve the Get Well Soon Wellness Festival', 900)
    await a.at(a.p(2) + 0.6)
    await a.hover('text=Nancy Hughes', 800)
    await a.sleep(1400)
    await a.hover('text=Courtney Woo', 800)
    await a.at(a.p(3) + 0.8)
    await a.hover('text=Approve the Get Well Soon Wellness Festival', 900)
    await a.at(a.p(4) + 0.8)
    await a.hover('text="Passed"', 900)
    await a.sleep(1800)
    await a.hover('text=Nancy Hughes', 700)
    await a.at(a.p(5) + 0.6)
    await a.scrollTo('text=Authorize opening the corporate bank account', 1100)
    await a.hover('text=Authorize opening the corporate bank account', 800)
    await a.sleep(1500)
    await a.hover('text=Lee Taylor II', 700)
    await a.at(a.p(6) + 1.0)
    await a.click('text="Documents"')
    await a.sleep(700)
    await a.hover('text=Board Action & Vote', 900)
    await a.move(900, 520, 900)
  },
}
