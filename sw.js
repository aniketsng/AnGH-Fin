const cacheName = 'angh-ledger-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/customer.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  // Pre-cache assets during installation
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assetsToCache);
    }).catch(err => {
      console.error('SW install: cache addAll failed', err);
    })
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches if needed
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if (key !== cacheName) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        // Cache successful GET requests from same-origin
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const cloned = networkResponse.clone();
        caches.open(cacheName).then(cache => {
          cache.put(event.request, cloned);
        });
        return networkResponse;
      }).catch(() => {
        // If both cache and network fail, try to return index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
