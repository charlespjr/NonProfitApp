module.exports = {
  num: 4,
  slug: 'how-the-launch-checklist-works',
  title: 'How the Launch Checklist Works',
  next: 'Stage 1: Form the Corporation & Get Your Tax ID',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `The Launch Checklist is your roadmap — twenty-seven steps, in the order the law actually works. Let's open it from the left menu.`,
    `At the top, your progress card: eight of twenty-seven steps complete. Every box you tick moves this number — and the ring on your Dashboard — forward.`,
    `The steps are grouped into five stages, from forming the corporation all the way to raising money. Each stage keeps its own little count, like two of two here.`,
    `And every step is written in plain English. Under each title there's a short note: what to do, where to go, and what it costs. No legal dictionary required.`,
    `When a step has paperwork, the document is linked right there. See Adopt and certify the Bylaws? Click Open, and the exact document appears.`,
    `Finished something in real life? Click the circle next to it. Watch the counts update — nine of twenty-seven, just like that.`,
    `And don't feel rushed. One step at a time, in order, is exactly how this list is meant to be walked.`,
    `In the next five videos, we'll walk each stage together. First up: forming the corporation, and getting your tax ID.`,
  ],
  overlays: [
    { text: 'Your roadmap', p: 1 },
    { text: '27 steps · 5 stages', p: 3 },
    { text: 'Plain English, every step', p: 4 },
    { text: 'Click the circle', p: 6 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.8)
    await a.click('text="Launch Checklist"')
    await a.at(a.p(2) + 0.5)
    await a.hover('text=Foundation launch checklist', 900)
    await a.at(a.p(3) + 0.6)
    await a.hover('text=Form the Corporation', 800); await a.sleep(1200)
    await a.hover('text="2/2"', 600)
    await a.at(a.p(4) + 0.6)
    await a.scrollTo('text=Obtain a federal Employer Identification Number', 1200)
    await a.hover('text=Apply for a free EIN', 900)
    await a.at(a.p(5) + 0.5)
    await a.scrollTo('text=Adopt & certify the Bylaws', 1200)
    await a.hover('button:has-text("Open")', 900)
    await a.at(a.p(6) + 0.4)
    await a.scrollTo('text=Adopt the Whistleblower Policy', 1100)
    const b = await a.hover('text=Adopt the Whistleblower Policy', 700)
    if (b) {
      await a.move(b.x - 26, b.y + b.height / 2, 500)
      await a.page.mouse.down(); await a.sleep(90); await a.page.mouse.up()
    }
    await a.at(a.p(7) + 0.6)
    await a.scrollTo('text=Foundation launch checklist', 1400)
    await a.hover('text=9 of 27', 900)
    await a.at(a.p(8) + 1.0)
    await a.move(900, 500, 1100)
  },
}
