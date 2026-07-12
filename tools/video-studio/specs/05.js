module.exports = {
  num: 5,
  slug: 'stage-1-form-the-corporation',
  title: 'Stage 1: Form the Corporation & Get Your Tax ID',
  next: 'Stage 2: The Organizational Board Meeting',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Stage one is short, but mighty: form the corporation, and get its tax ID. Open your Launch Checklist and follow along.`,
    `Step one: file the Articles of Incorporation with the California Secretary of State. You do it online, through their bizfile system. When it's approved, you get back a stamped copy — that's the foundation's birth certificate. Save it forever.`,
    `Step two: get the foundation's E I N — its free federal tax ID — at IRS dot gov. The online form takes about ten minutes, and you receive the number right away.`,
    `The order matters: the E I N comes after the Articles — and later, the bank will ask to see both. Notice ours are checked off and crossed out. Done, and done.`,
    `That's stage one — the foundation legally exists. Next: the big one. The organizational board meeting.`,
  ],
  overlays: [
    { text: 'Two steps, big result', p: 1 },
    { text: 'Articles of Incorporation', p: 2 },
    { text: 'EIN — your free tax ID', p: 3 },
    { text: 'Articles first, then EIN', p: 4 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.6)
    await a.click('text="Launch Checklist"')
    await a.sleep(600)
    await a.hover('text=Form the Corporation', 800)
    await a.at(a.p(2) + 0.8)
    await a.hover('text=File Articles of Incorporation', 800)
    await a.sleep(1800)
    await a.hover('text=Go to the California Secretary', 900)
    await a.at(a.p(3) + 0.8)
    await a.hover('text=Obtain a federal Employer Identification Number', 800)
    await a.sleep(1600)
    await a.hover('text=Apply for a free EIN', 900)
    await a.at(a.p(4) + 1.2)
    await a.hover('text=File Articles of Incorporation', 700)
    await a.sleep(1400)
    await a.hover('text=Obtain a federal Employer Identification Number', 700)
    await a.at(a.p(5) + 0.8)
    await a.hover('text="2/2"', 800)
    await a.move(900, 520, 1000)
  },
}
