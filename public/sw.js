const CACHE = 'mmm-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './index.html'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

async function cacheFirst(request) {
  const hit = await caches.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res.ok) {
    const copy = res.clone()
    caches.open(CACHE).then((cache) => cache.put(request, copy))
  }
  return res
}

async function networkFirstNavigation(request) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const copy = res.clone()
      caches.open(CACHE).then((cache) => cache.put(request, copy))
    }
    return res
  } catch {
    const hit = await caches.match(request)
    if (hit) return hit
    throw new Error('offline with no cache')
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event.request))
  } else {
    event.respondWith(cacheFirst(event.request))
  }
})