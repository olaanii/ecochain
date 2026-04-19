/* EcoChain Service Worker  handles Web Push + notification click routing. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "EcoChain", body: "New update" };
  try {
    if (event.data) payload = event.data.json();
  } catch (_) {
    try { payload.body = event.data.text(); } catch (_) {}
  }
  const { title, body, url, tag, data } = payload;
  event.waitUntil(
    self.registration.showNotification(title || "EcoChain", {
      body: body || "",
      tag: tag || "ecochain",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: url || "/", ...(data || {}) },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      for (const client of all) {
        if ("focus" in client) { client.navigate(target); return client.focus(); }
      }
      return self.clients.openWindow(target);
    })
  );
});
