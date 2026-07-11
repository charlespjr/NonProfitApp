/**
 * Quorum service worker — deliberately conservative.
 *
 * Network-first for everything, falling back to cache only when offline, and
 * /api requests are never intercepted. This makes the app installable on
 * Android/iOS and able to open offline, without ever serving a stale build
 * to an online user.
 */
const CACHE = 'quorum-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return // auth & data always live
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {})
        }
        return res
      })
      .catch(() =>
        caches.match(event.request).then((hit) => hit || caches.match('/index.html')),
      ),
  )
})
