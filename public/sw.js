// Service Worker for Pandit Ji Online (Network-First with Full Offline Support)
const CACHE_NAME = 'panditji-v11';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app-icon.svg',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/pandit-photo.jpg',
  '/FB_IMG_1792320177760.jpg',
  '/pandit-shashank-sharma.jpg',
  '/assets/deities/surya.jpg',
  '/assets/deities/shiva.jpg',
  '/assets/deities/hanuman.jpg',
  '/assets/deities/ganesh.jpg',
  '/assets/deities/vishnu.jpg',
  '/assets/deities/durga.jpg',
  '/assets/deities/shani.jpg',
  '/assets/deities/ram_darbar.jpg',
  '/assets/deities/radha_krishna.jpg',
  '/assets/deities/lakshmi.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not cache API requests or non-GET requests
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  // Network-First strategy: always load fresh files, fallback to cache only when offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
