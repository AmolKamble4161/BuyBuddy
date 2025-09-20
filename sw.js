self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("list-to-buy-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/icon-192x192.png",
        "/icon-512x512.png",
        "/favicon.ico"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
