/**
 * DataFlare Service Worker
 * Enables PWA offline support and home-screen installation.
 * Strategy: Cache-first for static assets, network-first for API calls.
 */

const CACHE_NAME = 'dataflare-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
];

// ── Install: cache static files ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Don't fail install if some assets aren't available yet
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fall back to network ───────────────────────────
self.addEventListener('fetch', (event) => {
  // Skip API calls — always go to network for fresh data
  if (event.request.url.includes('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        // Cache new successful GET responses
        if (response.ok && event.request.method === 'GET') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
    ).catch(() => caches.match('/index.html')) // offline fallback
  );
});
