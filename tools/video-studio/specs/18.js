module.exports = {
  num: 18,
  slug: 'taking-notes',
  title: 'Taking Notes',
  next: 'Board Member Quick Start',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Board work generates thoughts — questions for counsel, ideas for the festival, things to remember before the next meeting. Notes is where they live, right inside the portal.`,
    `Open Notes from the menu... and click New note.`,
    `Give it a title — Questions for counsel. Then click below, and just type. Bullet points, reminders, half-formed ideas — this is your own private notebook.`,
    `Now watch the little word next to the title... Saved. The portal saves as you type. There is no save button to forget.`,
    `Your notes stack up in the list on the left — click any one to reopen it. And the small trash icon quietly removes what you no longer need.`,
    `A small feature, and a lot of calm. Next: a two-minute quick start, built just for your board members.`,
  ],
  overlays: [
    { text: 'Your private notebook', p: 1 },
    { text: 'Click New note', p: 2 },
    { text: 'Saved — as you type', p: 4 },
  ],
  actions: async a => {
    await a.at(a.p(2) + 0.4)
    await a.click('text="Notes"')
    await a.sleep(900)
    await a.click('button:has-text("New note")')
    await a.at(a.p(3) + 0.6)
    await a.type('input[placeholder="Note title"]', 'Questions for counsel', 65)
    await a.sleep(400)
    await a.type('textarea', 'Ask about the 1023-EZ eligibility worksheet.\nConfirm the conflict-of-interest disclosure deadline.\nFestival insurance — one-day event rider?', 26)
    await a.at(a.p(4) + 1.6)
    await a.hover('text="Saved"', 900)
    await a.at(a.p(5) + 0.6)
    await a.hover('text=Questions for counsel', 800)
    await a.sleep(1500)
    await a.hover('[title="Delete"]', 800)
    await a.at(a.p(6) + 0.8)
    await a.move(900, 500, 1000)
  },
}
