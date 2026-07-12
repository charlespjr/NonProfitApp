module.exports = {
  num: 8,
  slug: 'stage-4-tax-exemption-registration',
  title: 'Stage 4: Tax Exemption & Charitable Registration',
  next: 'Stage 5: Ready to Raise Money',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Stage four makes it official with the tax authorities. Scroll to Tax Exemption and Charitable Registration — five steps, each with a deadline worth knowing.`,
    `First, the Statement of Information — form S I one hundred — filed with the Secretary of State within ninety days of your Articles. Small fee, and you refile it every two years.`,
    `Then the big one: IRS form ten twenty-three — your application for five-oh-one-c-three status. There's a fee, and a smart deadline: file within twenty-seven months of formation, so the exemption reaches back to day one. This is the step where an accountant earns their keep.`,
    `Next, register with the California Attorney General's Registry of Charities — form C T one. The deadline is real: within thirty days of receiving any money, and before you fundraise.`,
    `When the IRS determination letter arrives, file California form thirty-five hundred A, so the state exempts you too. It depends on the federal approval, which is why it comes last.`,
    `And finally: put the yearly renewals on the calendar — the R R F one, and IRS form nine-ninety. Missing those can cost you the exemption itself.`,
    `Five filings, in the right order — and the checklist keeps them straight. Next: stage five. You're ready to raise money.`,
  ],
  overlays: [
    { text: 'Five filings, five deadlines', p: 1 },
    { text: 'IRS Form 1023 — the big one', p: 3 },
    { text: 'Register before you fundraise', p: 4 },
    { text: 'Calendar the renewals', p: 6 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.6)
    await a.click('text="Launch Checklist"')
    await a.sleep(500)
    await a.scrollTo('text=Tax Exemption & Charitable Registration', 1400)
    await a.at(a.p(2) + 0.5)
    await a.hover('text=File the Statement of Information', 800)
    await a.sleep(1600)
    await a.hover('text=within 90 days', 900)
    await a.at(a.p(3) + 0.7)
    await a.hover('text=File IRS Form 1023', 800)
    await a.sleep(2000)
    await a.hover('text=file within 27 months', 900)
    await a.at(a.p(4) + 0.7)
    await a.hover('text=Register with the CA Attorney General', 800)
    await a.sleep(1700)
    await a.hover('text=within 30 days of receiving any money', 900)
    await a.at(a.p(5) + 0.7)
    await a.hover('text=File CA FTB Form 3500A', 800)
    await a.sleep(1600)
    await a.hover('text=Do this after the IRS determination letter', 900)
    await a.at(a.p(6) + 0.6)
    await a.hover('text=Calendar annual renewals', 800)
    await a.sleep(1500)
    await a.hover('text=Missing these can cost', 900)
    await a.at(a.p(7) + 0.8)
    await a.hover('text=Tax Exemption & Charitable Registration', 800)
    await a.move(900, 520, 1000)
  },
}
