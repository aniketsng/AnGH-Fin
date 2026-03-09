const cacheName = "angh-ledger-v1";
const assetsToCache = [
  '/',
  '/index.html',
  '/customer.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );

self.addEventListener("fetch", e => {
e.respondWith(
caches.match(e.request).then(response => {
return response || fetch(e.request);
})
);
});