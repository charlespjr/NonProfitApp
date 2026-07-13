module.exports = {
  num: 16,
  slug: 'using-the-calendar',
  title: 'Using the Calendar',
  next: 'Connecting Google Calendar & Zoom',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Every board date lives in one place: the Calendar. Let's open it from the left menu.`,
    `Here's the month at a glance. The little tiles are your board's life — the counsel call, the organizational meeting, the disclosure deadline. It fills in as the launch moves.`,
    `On the right, This month lists the same events in order, with the details: the date, the time, and who's involved.`,
    `See the badges up top? Google Calendar connected means every event here also lands on the calendar you already carry in your pocket. No double entry, no missed meetings.`,
    `And when a meeting happens on Zoom, there's a Join Zoom button right on the event. At meeting time, that's one click — no hunting through email for the link.`,
    `Best of all: when you create a motion, its vote meeting schedules itself, right here. Everything in its place. Next: connecting Google Calendar and Zoom, if yours aren't linked yet.`,
  ],
  overlays: [
    { text: 'Every date, one place', p: 2 },
    { text: 'Synced to your phone', p: 4 },
    { text: 'One-click Join Zoom', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.2)
    await a.click('text="Calendar"')
    await a.at(a.p(2) + 0.5)
    await a.hover('text=Counsel intro call', 800)
    await a.sleep(1500)
    await a.hover('text=Organizational Board Meeting', 800)
    await a.sleep(1300)
    await a.hover('text=Conflict-of-', 800)
    await a.at(a.p(3) + 0.5)
    await a.hover('text=This month', 800)
    await a.sleep(1500)
    await a.hover('text=EIN + bank account errands', 800)
    await a.at(a.p(4) + 0.6)
    await a.hover('text=Google Calendar connected', 900)
    await a.sleep(1800)
    await a.hover('text=Zoom connected', 800)
    await a.at(a.p(5) + 0.8)
    await a.hover('text="Join Zoom"', 900)
    await a.at(a.p(6) + 1.2)
    await a.hover('text=Bylaws Adoption Review', 900)
    await a.move(900, 500, 1000)
  },
}
