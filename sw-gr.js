// Green Reader Service Worker
// © 2026 YUSUKE MORI. All rights reserved.

const CACHE_NAME = 'green-reader-v2';

const PRECACHE_URLS = [
  './green-reader.html',
  './gr-manifest.json',
  './gr-icon-192.png',
  './gr-icon-512.png',
  './how-to.html',
  './how-to-en.html',
  './privacy.html',
  './privacy-en.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap'
];

// Install: precache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for precached, network-first for others
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('open-meteo.com')) return;

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) {
          // Return cache immediately, update in background
          fetch(e.request)
            .then(res => {
              if (res.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
            })
            .catch(() => {});
          return cached;
        }
        return fetch(e.request)
          .then(res => {
            if (res.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
            return res;
          })
          .catch(() => caches.match('./green-reader.html'));
      })
  );
});
