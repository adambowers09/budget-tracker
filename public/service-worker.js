const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "idb.js",
    "/js/index.js",
    "service-worker.js",
    "/css/styles.css",
    "./manifest.json"
  ];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Your files were pre-cached successfully!");
        cache
          .addAll(FILES_TO_CACHE)
          .then((result) => {
            
            console.log("result of add all", result);
          })
          .catch((err) => {
            
            console.log("Add all error: ", err);
          });
      })
      .catch((err) => {
        console.log(err);
      })
  );

  self.skipWaiting();
});


self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});