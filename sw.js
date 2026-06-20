// Update this version number every time you push new changes
// Change v1 to v2, v3, v4 etc. and old cache clears automatically
const CACHE = 'cacyof-v1';

const ASSETS = [
  'index.html',
  'manifest.json'
];

// INSTALL — cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // activate immediately, no waiting
  );
});

// ACTIVATE — delete ALL old caches automatically
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE) // delete anything that is not current version
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // take control of all open tabs immediately
  );
});

// FETCH — network first, cache as fallback
// This means users ALWAYS get the latest version if they have internet
// Only falls back to cache if they are offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Save fresh copy to cache
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res; // return fresh network response
      })
      .catch(() => {
        // No internet — serve from cache
        return caches.match(e.request);
      })
  );
});
