// public/service-worker.js

// Bump this when you deploy to force a new cache
const CACHE_NAME = 'ramp-tracker-cache-v3';

// Static assets to cache (NOT index.html – we handle HTML with network-first)
const ASSETS = [
  '/vite.svg',
  '/manifest.json',
  // Add other truly-static files if you want, e.g. icons under /public
];

// Install: precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Make the new SW take control ASAP
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch:
// - For navigations (HTML), use NETWORK-FIRST so new deployments show up.
// - For everything else, use CACHE-FIRST with network fallback.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Handle SPA navigations (document requests)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => res) // always prefer network
        .catch(() => caches.match('/index.html')) // offline fallback if you ever cache it
    );
    return;
  }

  // For other requests: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Optionally cache GET responses
        if (req.method === 'GET' && res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
