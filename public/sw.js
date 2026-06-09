// Finora - PWA Service Worker (Cleaned cache to prevent blank screens)
const CACHE_NAME = "finora-v1";

// Install Event
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (e) => {
  // Clear all caches to purge stale files causing blank screens
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Direct network bypass to ensure fresh bundle files)
self.addEventListener("fetch", (e) => {
  // Let browser fetch everything straight from network
  return;
});

// Push notification / simulated alarm hook
self.addEventListener("push", (event) => {
  let data = { title: "Finora Alert", body: "Remember to log your budget!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Finora Alert", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click to open or focus the PWA app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Focus existing window or open a new one
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
