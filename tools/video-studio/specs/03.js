module.exports = {
  num: 3,
  slug: 'dashboard-tour',
  title: 'A Tour of Your Dashboard',
  next: 'How the Launch Checklist Works',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Your Dashboard is the front page of your foundation's launch. Let's read it together, from the top.`,
    `First, the greeting — the portal knows who you are. And in the top corner sits the launch progress ring: eight of twenty-seven tasks done so far. It fills in as you go.`,
    `Under the greeting are four small cards. Awaiting signature counts documents waiting in DocuSeal. Signed shows what's completed and filed.`,
    `Open tasks is what's left on your launch checklist. And Next meeting shows the very next date on the board's calendar.`,
    `The Launch checklist card previews your next few steps. Clicking View all takes you to the full roadmap — we'll tour it in the next video.`,
    `Below that, Recent documents. Each one wears a little badge — Draft, Awaiting signatures, or Fully signed — so you can spot what needs attention.`,
    `On the right: Upcoming meetings. When a meeting has a video call, there's a blue Join button — one click, and you're in.`,
    `And the top bar works everywhere. Search your documents on the left... or jot something down with New note on the right.`,
    `That's your Dashboard — mission control. When in doubt, come back here: it always shows what needs you next. Next up: the Launch Checklist.`,
  ],
  overlays: [
    { text: 'Mission control', p: 1 },
    { text: '8 of 27 tasks done', p: 2 },
    { text: 'Four cards, four answers', p: 3 },
    { text: 'Badges show status', p: 6 },
    { text: 'One-click Join', p: 7 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 0.5)
    await a.hover('text=Good ', 900)
    await a.at(a.p(2) + 1.6)
    await a.hover('text=Launch progress', 900)
    await a.at(a.p(3) + 0.8)
    await a.hover('text=Awaiting signature', 700); await a.sleep(1300)
    await a.hover('text="Signed"', 700)
    await a.at(a.p(4) + 0.4)
    await a.hover('text=Open tasks', 700); await a.sleep(1200)
    await a.hover('text=Next meeting', 700)
    await a.at(a.p(5) + 0.5)
    await a.hover('text=Launch checklist', 700); await a.sleep(1300)
    await a.hover('text=View all', 700)
    await a.at(a.p(6) + 0.5)
    await a.hover('text=Recent documents', 700); await a.sleep(1400)
    await a.hover('text=Fully signed', 700)
    await a.at(a.p(7) + 0.5)
    await a.hover('text=Upcoming meetings', 700); await a.sleep(1300)
    await a.hover('button:has-text("Join")', 700)
    await a.at(a.p(8) + 0.4)
    await a.hover('input[placeholder^="Search documents"]', 800); await a.sleep(1500)
    await a.hover('button:has-text("New note")', 700)
    await a.at(a.p(9) + 0.8)
    await a.move(860, 480, 1100)
  },
}
