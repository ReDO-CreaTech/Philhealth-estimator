const CACHE_NAME = "siyasat-cache-v8";

const urlsToCache = [
  "/",
  "index.html",
  "faq.html",
  "about.html",
  "contact.html",
  "style.css",
  "x.js",
  "x1.js",
  "x2.js",
  "manifest.json"
];

// INSTALL
// self.addEventListener("install", event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => cache.addAll(urlsToCache))
//   );
//   self.skipWaiting();
// });

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log("Cached:", url);
        } catch (err) {
          console.error("Failed to cache:", url);
        }
      }
    })
  );
});



// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (ONLY ONE!)
// self.addEventListener("fetch", event => {
//   const request = event.request;

//   // Handle page navigation (offline fallback)
//   if (request.mode === "navigate") {
//     event.respondWith(
//       fetch(request).catch(() => caches.match("/index.html"))
//     );
//     return;
//   }

//   // JSON: network first
//   if (request.url.endsWith(".json")) {
//     event.respondWith(
//       fetch(request)
//         .then(response => {
//           const copy = response.clone();
//           caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
//           return response;
//         })
//         .catch(() => caches.match(request))
//     );
//     return;
//   }

//   // Default: cache first
//   event.respondWith(
//     caches.match(request).then(cached => cached || fetch(request))
//   );
// });

self.addEventListener('fetch', event => {
  const request = event.request;

  // 1. Handle page navigation (Try cache, then network, then fall back to index)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request) // 1. Try to match specific page (/about.html)
        .then(response => response || fetch(request)) // 2. Try Network
        .catch(() => caches.match('/index.html')) // 3. Fallback to index.html
    );
    return;
  }

// Handle JS files (network first optional)
if (request.url.endsWith('.js')) {
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
  return;
}

  // 3. Static Assets: cache first
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});


