module.exports = {
  num: 19,
  slug: 'board-member-quick-start',
  title: 'Board Member Quick Start',
  next: 'Managing Team & Access (for IT)',
  seed: {
    sessionUserId: 'judy',
    sig: {
      minutes: { alitalia: true, judy: true, lee: true, courtney: true, charles: true, joe: true, nancy: true },
      bylaws: { alitalia: true, lee: true, courtney: true },
    },
    motions: [{
      id: 'mo-coi',
      title: 'Adopt the Conflict of Interest Policy',
      desc: 'Adopt the Conflict of Interest Policy as circulated, and collect signed disclosure forms from all directors.',
      meeting: '',
      created: 'Jul 10, 2026',
      votes: { alitalia: 'for', lee: 'for' },
      zoomUrl: 'https://zoom.us/j/86691234501',
      voteDay: 15,
      voteTime: '4:00 PM',
      notifiedAt: 'Jul 10, 2026',
      notifiedCount: 6,
    }],
  },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `This one's for board members. Welcome aboard, director — here's your two-minute tour, and the three things you'll actually do in this portal.`,
    `When you sign in, the Dashboard greets you by name — this is Judy's view, our Vice Chair. Same portal as everyone, just sized to your role.`,
    `Thing one: sign documents. Open Documents, find anything marked Awaiting signatures, and click Open in DocuSeal. Next to your own name there's a Sign now button. Click — done.`,
    `Thing two: vote. Open Board Votes. On an open motion, find your name, and click For, Against, or Abstain. One click, and you're on the record.`,
    `Thing three: show up. The Calendar holds every board date, with a Join button when it's a video call.`,
    `Notice there's nothing to break — no admin buttons in sight. The portal only shows you what's yours.`,
    `Sign, vote, show up. Do those three, and you're a great digital board member. The rest of this series goes deeper, whenever you're curious.`,
  ],
  overlays: [
    { text: 'For board members', p: 1 },
    { text: '1 · Sign', p: 3 },
    { text: '2 · Vote', p: 4 },
    { text: '3 · Show up', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(2) + 0.5)
    await a.hover('text=Good ', 900)
    await a.at(a.p(3) + 0.7)
    await a.click('text="Documents"')
    await a.sleep(700)
    await a.hover('text=Awaiting signatures', 700)
    await a.sleep(900)
    await a.click('button:has-text("Open in DocuSeal")')
    await a.sleep(1100)
    await a.click('button:has-text("Sign now")')
    await a.sleep(1300)
    await a.backdrop()
    await a.at(a.p(4) + 0.6)
    await a.click('text="Board Votes"')
    await a.sleep(900)
    await a.hover('text=Judy Adams', 700)
    await a.sleep(800)
    await a.click('button:has-text("For")')
    await a.at(a.p(5) + 0.5)
    await a.click('text="Calendar"')
    await a.sleep(800)
    await a.hover('text="Join Zoom"', 900)
    await a.at(a.p(6) + 0.6)
    await a.hover('text=WORKSPACE', 800)
    await a.at(a.p(7) + 0.8)
    await a.move(900, 480, 1100)
  },
}
