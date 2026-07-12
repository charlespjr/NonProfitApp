module.exports = {
  num: 2,
  slug: 'signing-in-getting-the-app',
  title: 'Signing In & Getting the App',
  next: 'A Tour of Your Dashboard',
  seed: { sessionUserId: null },
  paragraphs: [
    `Quorum — the Nonprofit Board OS.`,
    `Welcome back. In this video, we'll sign in to the portal — and put it on your phone or computer, so it's always one tap away.`,
    `Start at your organization's web address. This page is your board's private front door.`,
    `Click the first box, and type your username. It's usually your first name, or your name with a dot — you'll find it in your welcome email.`,
    `Next, click the Password box, and type your password. If you ever forget it, use the Forgot link on the right — no shame in it.`,
    `Leave "Keep me signed in" checked on your own device. Then click the big Sign in button. And just like that — you're home.`,
    `One more nice touch. In the bottom corner of the menu, find Install app — and click it.`,
    `Follow the short steps you see. On a phone, it's "Add to Home Screen." The portal becomes an app icon — no app store needed.`,
    `From then on, Quorum opens full screen, straight from your home screen. One tap, and you're at the board's door.`,
    `That's it. Next, let's take a proper look around your Dashboard.`,
  ],
  overlays: [
    { text: 'One tap away', p: 1 },
    { text: 'Type your username', p: 3 },
    { text: 'Click Sign in', p: 5 },
    { text: 'Install app', p: 6 },
    { text: 'Add to Home Screen', p: 7 },
  ],
  actions: async a => {
    await a.at(a.p(2) + 0.5)
    await a.hover('text=Welcome back', 800)
    await a.at(a.p(3) + 0.6)
    await a.type('input[placeholder="username or email address"]', 'alitalia', 60)
    await a.at(a.p(4) + 0.6)
    await a.type('input[type="password"]', 'gowellsoon', 50)
    await a.hover('text=Forgot?', 700)
    await a.at(a.p(5) + 0.7)
    await a.hover('text=Keep me signed in on this device', 600)
    await a.at(a.p(5) + 2.4)
    await a.click('button:has-text("Sign in")')
    await a.sleep(800)
    await a.move(950, 400, 900)
    await a.at(a.p(6) + 0.8)
    await a.click('text=Install app')
    await a.at(a.p(7) + 0.5)
    await a.hover('text=Install Quorum on this device', 700)
    await a.move(960, 640, 900)
    await a.at(a.p(8) + 1.2)
    await a.backdrop()
    await a.move(950, 420, 1000)
  },
}
