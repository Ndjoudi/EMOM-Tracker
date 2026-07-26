// ─── Service Worker minimal ───
// Nécessaire uniquement pour showNotification() : iOS PWA refuse
// le constructeur `new Notification()` et exige un service worker.
// Pas de cache offline ici — l'app reste servie normalement par le réseau.

self.addEventListener('install',  e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Ramène l'app au premier plan quand on tape la notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if ('focus' in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
