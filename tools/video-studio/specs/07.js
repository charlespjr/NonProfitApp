module.exports = {
  num: 7,
  slug: 'stage-3-banking-signatories-insurance',
  title: 'Stage 3: Banking, Signatories & Insurance',
  next: 'Stage 4: Tax Exemption & Charitable Registration',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Stage three moves the foundation into the real world: a bank account, sensible spending rules, and insurance. Open the checklist, and scroll to Banking, Signatories and Insurance.`,
    `First: open the corporate bank account. The bank will ask for three things — the stamped Articles, the E I N letter, and a signed Board Resolution naming who's allowed to sign.`,
    `That resolution is already waiting in your Documents library — the Board Resolution and Written Consent. Fill in the bank details, have the directors sign it, and bring it along.`,
    `Second: set the two-signature rule — the dollar amount above which two people must approve a payment. Many small nonprofits pick around twenty-five hundred dollars. Record it in the minutes.`,
    `Third: insurance. Get quotes for directors-and-officers coverage, and general liability. It protects the very people who volunteered to serve.`,
    `Three steps — honestly, one good errand day. Next: stage four. Tax exemption, and charitable registration.`,
  ],
  overlays: [
    { text: 'Articles + EIN + Resolution', p: 2 },
    { text: 'The two-signature rule', p: 4 },
    { text: 'Protect your board', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.8)
    await a.click('text="Launch Checklist"')
    await a.sleep(500)
    await a.scrollTo('text=Banking, Signatories & Insurance', 1400)
    await a.at(a.p(2) + 0.5)
    await a.hover('text=Open the corporate bank account', 800)
    await a.sleep(1600)
    await a.hover('text=Take your stamped Articles', 900)
    await a.at(a.p(3) + 0.7)
    await a.click('text="Documents"')
    await a.sleep(600)
    await a.hover('text=Board Resolution & Written Consent', 900)
    await a.sleep(1500)
    await a.hover('text=A written consent that authorizes banking', 800)
    await a.at(a.p(4) + 0.5)
    await a.click('text="Launch Checklist"')
    await a.sleep(400)
    await a.scrollTo('text=Set the two-signature threshold', 1100)
    await a.hover('text=Set the two-signature threshold', 800)
    await a.at(a.p(5) + 0.5)
    await a.hover('text=Obtain D&O and general liability insurance', 800)
    await a.sleep(1500)
    await a.hover('text=Get quotes for Directors', 800)
    await a.at(a.p(6) + 0.8)
    await a.hover('text=Banking, Signatories & Insurance', 800)
    await a.move(900, 500, 1000)
  },
}
