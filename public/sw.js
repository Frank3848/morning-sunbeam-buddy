// CashPay Service Worker - Push notifications only (no offline caching)
// IMPORTANT: previous versions cached the app shell which caused blank pages
// after deploys / when wrapped by Median. This version clears all old caches
// and lets every request hit the network so the app always loads fresh.

const SW_VERSION = 'cashpay-v3-no-cache';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Nuke every cache this SW previously created so no stale HTML / JS is served
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      await self.clients.claim();
      // Reload open windows so they pick up the fresh network response
      const wins = await self.clients.matchAll({ type: 'window' });
      await Promise.allSettled(wins.map((c) => c.navigate(c.url)));
    })()
  );
});

// Intentionally no fetch handler — requests go straight to the network.

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'CashPay', body: event.data.text() }; }
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    tag: data.tag || 'cashpay-notification',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(data.title || 'CashPay', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow(event.notification.data || '/');
    })
  );
});
