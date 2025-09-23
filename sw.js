const CACHE_NAME = 'listcart-cache-v1.3'; // bump version when you update files
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './images/icons/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event: caches the static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // safer caching: logs failures instead of rejecting whole addAll
        return Promise.all(
          urlsToCache.map(url =>
            cache.add(url).catch(err => 
              console.error('❌ Failed to cache:', url, err)
            )
          )
        );
      })
      .catch(error => {
        console.error('[Service Worker] Failed to open cache during install:', error);
      })
  );
  self.skipWaiting(); // Forces this SW to activate immediately
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: serves content from cache or fetches from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', event.request.url, error);
            return new Response('Network request failed and no cache available.', {
              status: 408,
              statusText: 'Request Timeout'
            });
          });
      })
  );
});

// Message listener to skipWaiting from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});