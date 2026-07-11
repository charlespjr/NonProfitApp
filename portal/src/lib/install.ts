/**
 * PWA install plumbing. Chrome/Edge (desktop + Android) fire
 * `beforeinstallprompt` when the app is installable; we stash the event so a
 * visible button can trigger the real one-tap install prompt. iOS Safari has
 * no programmatic install, so callers fall back to guided instructions.
 * `initInstallCapture()` must run before React renders — the event can fire
 * during initial load.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export function initInstallCapture() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

/** True when the native one-tap install prompt is available right now. */
export const canPrompt = () => !!deferred

/** True when already running as an installed app. */
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true

/** iPhone/iPad — including iPadOS pretending to be a Mac. */
export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

/** Show the native install prompt. Resolves true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const ev = deferred
  deferred = null
  await ev.prompt()
  const choice = await ev.userChoice.catch(() => ({ outcome: 'dismissed' as const }))
  notify()
  return choice.outcome === 'accepted'
}

export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
