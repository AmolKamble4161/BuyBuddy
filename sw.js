self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("listCart-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/images/icons/icon-192.png",
        "/images/icons/icon-512.png",
        "/images/icons/favicon.ico"
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
