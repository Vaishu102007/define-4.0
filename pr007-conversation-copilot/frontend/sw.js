// Nimad AI Conversation Copilot — Progressive Web App Service Worker
const CACHE_NAME = 'nimad-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/integrations',
  '/static/base.css',
  '/static/components.css',
  '/static/session.css',
  '/static/integrations.css',
  '/static/calendar.css',
  '/assets/nimad-symbol-white.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept WebSockets, API calls, or range/media requests
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/ws') || event.request.headers.get('range')) {
    return;
  }

  // Network-first strategy with cache fallback for navigation and static assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
