var CACHE_NAME = '2021-10-17 13:42';
var urlsToCache = [
  "/type-numbers/",
  "/type-numbers/kohacu.webp",
  "/type-numbers/index.js",
  "/type-numbers/mp3/incorrect1.mp3",
  "/type-numbers/mp3/end.mp3",
  "/type-numbers/mp3/cat.mp3",
  "/type-numbers/mp3/correct3.mp3",
  "/type-numbers/favicon/original.svg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
