self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("list-to-buy-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/images/icon-192x192.png",
        "/images/icon-512x512.png",
        "/images/favicon.ico"
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
