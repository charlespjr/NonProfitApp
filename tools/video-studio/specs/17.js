module.exports = {
  num: 17,
  slug: 'connecting-google-calendar-zoom',
  title: 'Connecting Google Calendar & Zoom',
  next: 'Taking Notes',
  seed: { calConnected: false, zoomConnected: false },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Two quick connections make the Calendar shine: Google Calendar, and Zoom. Let's set up both — it takes about a minute, and you only do it once.`,
    `Open Calendar. If yours isn't connected yet, you'll see this friendly screen instead of a grid. Click Connect Google Calendar, sign in with your Google account, and allow access.`,
    `And there it is — the month view, alive. From now on, board events sync with the calendar you already check every day.`,
    `Now Zoom. Up by the month name, click Connect Zoom... and done. From here on, meetings and motions can schedule their own video calls.`,
    `See the Join Zoom buttons that just appeared down the rail? That's the payoff — one click into any board call, forever.`,
    `If you ever need to switch accounts, Disconnect is right there too. That's the plumbing, done. Next: keeping your thoughts together, with Notes.`,
  ],
  overlays: [
    { text: 'One minute, once', p: 1 },
    { text: 'Connect Google Calendar', p: 2 },
    { text: 'Connect Zoom', p: 4 },
    { text: 'Join buttons appear', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.6)
    await a.click('text="Calendar"')
    await a.at(a.p(2) + 0.6)
    await a.hover('text=Connect your calendar', 800)
    await a.sleep(2500)
    await a.click('button:has-text("Connect Google Calendar")')
    await a.at(a.p(3) + 0.8)
    await a.hover('text=Organizational Board Meeting', 900)
    await a.sleep(1200)
    await a.hover('text=Google Calendar connected', 800)
    await a.at(a.p(4) + 0.8)
    await a.click('text=Connect Zoom')
    await a.sleep(800)
    await a.hover('text=Zoom connected', 800)
    await a.at(a.p(5) + 0.7)
    await a.hover('text="Join Zoom"', 900)
    await a.at(a.p(6) + 0.6)
    await a.hover('text=Disconnect Zoom', 800)
    await a.move(900, 500, 1000)
  },
}
