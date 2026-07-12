module.exports = {
  num: 14,
  slug: 'how-directors-vote',
  title: 'How Directors Vote',
  next: 'Reading Vote Results',
  seed: {
    emailConnected: true,
    emailProvider: 'Hostinger',
    emailAddress: 'alitalia@adamsinfinitelegacy.org',
    motions: [{
      id: 'mo-coi',
      title: 'Adopt the Conflict of Interest Policy',
      desc: 'Adopt the Conflict of Interest Policy as circulated, and collect signed disclosure forms from all directors.',
      meeting: '',
      created: 'Jul 10, 2026',
      votes: { judy: 'for', lee: 'for' },
      zoomUrl: 'https://zoom.us/j/86691234501',
      voteDay: 15,
      voteTime: '4:00 PM',
      notifiedAt: 'Jul 10, 2026',
      notifiedCount: 6,
    }],
  },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `A motion is on the table: adopt the Conflict of Interest Policy. Time to vote. Here's exactly how it works, for every director.`,
    `You'll get an email when a motion needs you — or just open Board Votes. The motion card shows everything: what's being decided, when it was raised, and who's voted so far.`,
    `Find your own name in the list. Next to it are three buttons: For, Against, and Abstain. You can only vote as yourself — Judy and Lee have already cast theirs.`,
    `Let's vote For. One click... and it's done. The tally updates instantly, and your vote is on the record with your name and the date.`,
    `Want to talk it through first? Every motion gets its own Join vote meeting button — hop on the Zoom call, discuss, then click your vote.`,
    `That's three of seven in — one more For makes a majority. Reading those results is next.`,
  ],
  overlays: [
    { text: 'One director, one vote', p: 3 },
    { text: 'For · Against · Abstain', p: 4 },
    { text: 'Talk first, then vote', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 0.8)
    await a.click('text="Board Votes"')
    await a.sleep(700)
    await a.hover('text=Adopt the Conflict of Interest Policy', 900)
    await a.at(a.p(2) + 1.2)
    await a.hover('text=Adopt the Conflict of Interest Policy as circulated', 800)
    await a.at(a.p(3) + 0.5)
    await a.hover('text=Alitalia Adams', 800)
    await a.sleep(1400)
    await a.hover('text=Judy Adams', 700)
    await a.sleep(1000)
    await a.hover('text=Lee Taylor II', 700)
    await a.at(a.p(4) + 0.7)
    await a.click('button:has-text("For")')
    await a.sleep(1200)
    await a.hover('text=Adopt the Conflict of Interest Policy', 800)
    await a.at(a.p(5) + 0.7)
    await a.hover('text=Join vote meeting', 900)
    await a.at(a.p(6) + 0.6)
    await a.hover('text=Alitalia Adams', 800)
    await a.move(900, 500, 1000)
  },
}
