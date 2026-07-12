module.exports = {
  num: 10,
  slug: 'understanding-your-documents',
  title: 'Understanding Your Documents',
  next: 'Signing with DocuSeal',
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Every important paper the foundation owns lives in one place: the Documents library. Let's open it from the left menu.`,
    `Across the top, four tabs. All shows everything. Governance is the legal backbone — bylaws, minutes, resolutions. Fundraising holds the festival paperwork. And Donor Letters are your thank-you receipts.`,
    `Every row tells you the essentials: the document's name, a plain-English description of what it's for, the page count, and when it last changed.`,
    `The Status column is the one to watch. Draft means it's still being prepared. Awaiting signatures means it's out with the board in DocuSeal. And Fully signed means done — and safely on file.`,
    `Looking for something specific? Use the search box up top. Type a word or two... and the list narrows as you type.`,
    `When you're ready to work on a document, click Open in DocuSeal on its row — that's where reading and signing happen. Which is exactly what the next video is about.`,
  ],
  overlays: [
    { text: 'One library, four tabs', p: 2 },
    { text: 'Watch the Status column', p: 4 },
    { text: 'Search as you type', p: 5 },
  ],
  actions: async a => {
    await a.at(a.p(1) + 1.6)
    await a.click('text="Documents"')
    await a.at(a.p(2) + 0.6)
    await a.hover('button:has-text("All")', 600); await a.sleep(600)
    await a.click('button:has-text("Governance")'); await a.sleep(1200)
    await a.click('button:has-text("Fundraising")'); await a.sleep(1200)
    await a.click('button:has-text("Donor Letters")'); await a.sleep(1200)
    await a.click('button:has-text("All")')
    await a.at(a.p(3) + 0.5)
    await a.hover('text=Bylaws of Adams Infinite Legacy', 800)
    await a.sleep(1400)
    await a.hover('text=The rulebook for how the foundation operates', 700)
    await a.at(a.p(4) + 0.7)
    await a.hover('text="Draft"', 700); await a.sleep(1400)
    await a.hover('text=Awaiting signatures', 700); await a.sleep(1400)
    await a.hover('text=Fully signed', 700)
    await a.at(a.p(5) + 0.6)
    await a.type('input[placeholder^="Search documents"]', 'donor', 130)
    await a.sleep(1500)
    await a.click('input[placeholder^="Search documents"]', 300)
    await a.page.keyboard.press('Control+a'); await a.page.keyboard.press('Backspace')
    await a.at(a.p(6) + 0.8)
    await a.hover('button:has-text("Open in DocuSeal")', 900)
    await a.move(900, 500, 1000)
  },
}
