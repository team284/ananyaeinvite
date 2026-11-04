/* Offline cache for the invite. Bump VERSION whenever you change any file. */
const VERSION = 'invite-v2';
const SHELL = [
  './', 'index.html', 'css/style.css', 'js/config.js', 'js/app.js', 'manifest.webmanifest',
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
  // Pages: network first so edits show up, cache as fallback when offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { caches.open(VERSION).then(c => c.put('index.html', r.clone())); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // Everything else (css, js, fonts, photos): cache first, then fill the cache.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
