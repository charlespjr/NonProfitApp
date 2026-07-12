module.exports = {
  num: 6,
  slug: 'stage-2-organizational-board-meeting',
  title: 'Stage 2: The Organizational Board Meeting',
  next: 'Stage 3: Banking, Signatories & Insurance',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Stage two is the heart of the launch: the organizational board meeting. It looks long — fifteen steps — but most of them happen in a single afternoon, in one meeting.`,
    `First, hold the meeting itself. Gather all seven directors, in person or by video. The Organizational Board Minutes double as your agenda.`,
    `At that meeting, the board adopts and certifies the Bylaws — your rulebook. It's linked right here: click Open to read it or route it for signatures.`,
    `You'll also elect the officers, set the office address, confirm the fiscal year, and confirm that directors serve without pay. Four quick decisions, all recorded in the minutes.`,
    `Then come the protection policies: conflict of interest, document retention, whistleblower, gift acceptance, privacy — plus the criteria for who the foundation helps.`,
    `Two more items live here: approving the Get Well Soon Wellness Festival as an official program, and ratifying anything you did before the meeting.`,
    `You finish by approving and signing the Organizational Board Minutes — the official record of it all. Ours are already fully signed.`,
    `Six of fifteen done, and the rest are one good meeting away. Next: stage three — banking, signatories, and insurance.`,
  ],
  overlays: [
    { text: 'One afternoon, one meeting', p: 1 },
    { text: 'Adopt the Bylaws', p: 3 },
    { text: 'The protection policies', p: 5 },
    { text: 'Sign the Minutes', p: 7 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.6)
    await a.click('text="Launch Checklist"')
    await a.sleep(500)
    await a.scrollTo('text=Hold the Organizational Board Meeting', 1300)
    await a.hover('text="6/15"', 700)
    await a.at(a.p(2) + 0.5)
    await a.hover('text=Hold the organizational meeting of the Board', 800)
    await a.sleep(1500)
    await a.hover('text=Gather all seven directors', 800)
    await a.at(a.p(3) + 0.5)
    await a.scrollTo('text=Adopt & certify the Bylaws', 1000)
    await a.hover('text=Adopt & certify the Bylaws', 700)
    await a.sleep(1500)
    await a.hover('button:has-text("Open")', 800)
    await a.at(a.p(4) + 0.5)
    await a.hover('text=Elect officers and record them', 700); await a.sleep(1100)
    await a.hover("text=Set the corporation's principal office", 700); await a.sleep(1100)
    await a.scrollTo('text=Establish the fiscal year-end', 900)
    await a.hover('text=Confirm directors serve without compensation', 700)
    await a.at(a.p(5) + 0.5)
    await a.scrollTo('text=Adopt Conflict of Interest Policy', 1000)
    await a.hover('text=Adopt Conflict of Interest Policy', 700); await a.sleep(1000)
    await a.hover('text=Adopt the Document Retention', 700); await a.sleep(1000)
    await a.scrollTo('text=Adopt the Privacy Notice', 900)
    await a.hover('text=Adopt the Financial Assistance Eligibility', 700)
    await a.at(a.p(6) + 0.5)
    await a.scrollTo('text=Approve & plan the', 1000)
    await a.hover('text=Approve & plan the', 700); await a.sleep(1300)
    await a.hover('text=Ratify prior organizational acts', 700)
    await a.at(a.p(7) + 0.5)
    await a.scrollTo('text=Approve & sign the Organizational Board Minutes', 1000)
    await a.hover('text=Approve & sign the Organizational Board Minutes', 800)
    await a.at(a.p(8) + 0.6)
    await a.scrollTo('text=Hold the Organizational Board Meeting', 1200)
    await a.hover('text="6/15"', 800)
    await a.move(900, 520, 900)
  },
}
