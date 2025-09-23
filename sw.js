const CACHE_NAME = 'listcart-cache-v1.2'; // Increment this version number for any changes to cached assets!
const urlsToCache = [
    './', // The root HTML file
    'index.html', // Alias for the root file
    "/style.css",
    "/script.js",
    'manifest.json',
    'sw.js', // Cache the service worker itself
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    "/images/icons/icon-192.png",
    "/images/icons/icon-512.png",
    "/images/icons/favicon.ico"
    // Add any other static assets (images, custom fonts) you want to cache here.
];

// Install event: caches the static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Failed to cache during install:', error);
            })
    );
    self.skipWaiting(); // Forces the waiting service worker to become the active service worker
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
    // Ensure the service worker takes control of the page immediately after activation
    return self.clients.claim();
});

// Fetch event: serves content from cache or fetches from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }
                // No cache hit - fetch from network
                console.log('[Service Worker] Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Optionally, cache new successful requests as they come in (Cache-Then-Network)
                        // This can be useful for dynamic content that you want to be available offline after first load.
                        // if (networkResponse.ok && event.request.method === 'GET') {
                        //     return caches.open(CACHE_NAME).then(cache => {
                        //         cache.put(event.request, networkResponse.clone());
                        //         return networkResponse;
                        //     });
                        // }
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', event.request.url, error);
                        // If both cache and network fail, you can show an offline page
                        // For example: return caches.match('/offline.html');
                        // Or return a generic error response
                        return new Response('Network request failed and no cache available.', { status: 408, statusText: 'Request Timeout' });
                    });
            })
    );
});

// Message listener to skipWaiting from the client (for forced update)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});