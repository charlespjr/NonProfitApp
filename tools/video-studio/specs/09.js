module.exports = {
  num: 9,
  slug: 'stage-5-ready-to-raise-money',
  title: 'Stage 5: Ready to Raise Money',
  next: 'Understanding Your Documents',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Stage five is the fun one: getting ready to raise money. Two steps stand between you and your first sponsor.`,
    `First, set the sponsorship prices. The Sponsorship Prospectus for the Get Well Soon Festival lists the levels — Presenting, Gold, Silver, and Community. Click Open, decide what each level costs, and it's ready to send.`,
    `Second, finish the donor thank-you letters. There are four templates — cash gifts, in-kind gifts, quid pro quo, and the year-end summary. Add your E I N, and they're ready the moment someone gives.`,
    `You'll find all of these living in your Documents library too — under the Fundraising tab, and Donor Letters.`,
    `And that's the whole roadmap — five stages, twenty-seven steps, one foundation. Next up: understanding your documents.`,
  ],
  overlays: [
    { text: 'The fun stage', p: 1 },
    { text: 'Set your sponsor prices', p: 2 },
    { text: 'Four thank-you letters', p: 3 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.4)
    await a.click('text="Launch Checklist"')
    await a.sleep(500)
    await a.scrollTo('text=Ready to Raise Money', 1400)
    await a.at(a.p(2) + 0.6)
    await a.hover('text=Set sponsorship tier prices', 800)
    await a.sleep(1800)
    await a.hover('button:has-text("Open")', 900)
    await a.at(a.p(3) + 0.6)
    await a.hover('text=Finalize the donor acknowledgment letter', 800)
    await a.sleep(1800)
    await a.hover('text=Review the four donor thank-you letter', 900)
    await a.at(a.p(4) + 0.5)
    await a.click('text="Documents"')
    await a.sleep(600)
    await a.click('button:has-text("Fundraising")')
    await a.sleep(900)
    await a.hover('text=Sponsorship Prospectus', 800)
    await a.sleep(700)
    await a.click('button:has-text("Donor Letters")')
    await a.sleep(800)
    await a.hover('text=Donor Letter — Cash Gift', 800)
    await a.at(a.p(5) + 1.0)
    await a.click('text="All"')
    await a.move(900, 500, 1000)
  },
}
