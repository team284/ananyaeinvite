/* Offline cache for the invite: network first, cache only when offline. Bump VERSION when files change. */
const VERSION = 'invite-v11';
const SHELL = [
  './', 'index.html', 'css/style.css', 'js/config.js', 'js/app.js', 'manifest.webmanifest',
  'photos/events/mehendi.jpg', 'photos/events/sangeet.jpg', 'photos/events/vivah.jpg',
  'icons/favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/pinyon-script-latin-400-normal.woff2',
  'fonts/cinzel-latin-400-normal.woff2', 'fonts/cinzel-latin-500-normal.woff2', 'fonts/cinzel-latin-600-normal.woff2',
  'fonts/cormorant-garamond-latin-400-normal.woff2', 'fonts/cormorant-garamond-latin-500-normal.woff2',
  'fonts/cormorant-garamond-latin-600-normal.woff2', 'fonts/cormorant-garamond-latin-400-italic.woff2',
  'fonts/cormorant-garamond-latin-500-italic.woff2',
  'fonts/tiro-devanagari-hindi-devanagari-400-normal.woff2', 'fonts/tiro-devanagari-hindi-latin-400-normal.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Always try the network first (revalidating with the server), so guests see the latest
  // version of the invite. The cache is only used when the phone is offline.
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
        return r;
      })
      .catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req).then(hit => hit || caches.match(req)))
  );
});
