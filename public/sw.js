const CACHE_NAME = "restaurant-admin-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install event: cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching assets");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log("Cache addAll error:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Deleting cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip API calls and external requests
  if (
    event.request.url.includes("/api/") ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page if available
          console.log("Service Worker: Network request failed for", event.request.url);
        });
    })
  );
});

// Handle messages from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Restaurant Admin" };

  const options = {
    body: data.body || "New notification",
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23FF8C42' width='192' height='192'/><text x='50%' y='50%' font-size='100' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial'>🍽️</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><circle cx='48' cy='48' r='45' fill='%23FF8C42'/></svg>",
    tag: data.tag || "notification",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If window is open, focus it
      for (let client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
