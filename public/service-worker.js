// public/service-worker.js
// Bump this string any time you want to FORCE an update:
const CACHE_VERSION = "v7";                       // ← change to v8, v9… next time
const CACHE_NAME = `ramp-tracker-cache-${CACHE_VERSION}`;

// Precache only the shell; let the network load the fresh app chunks
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  // take control immediately on install
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  // delete ALL old ramp-tracker caches, then take control of pages
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("ramp-tracker-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Cache-first only for our shell; everything else hits the network (so you see new builds)
  const url = new URL(event.request.url);
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((resp) => {
            // refresh shell cache silently
            caches.open(CACHE_NAME).then((c) => c.put(event.request, resp.clone()));
            return resp;
          })
        );
      })
    );
    return;
  }
  // default: go to network (no stale bundle!)
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
