// Service worker basic d'EduTicTac Blocs Junior (junior).
// Objectiu: que l'aplicacio arranque sense xarxa despres de la primera visita.
// Canviar CACHE quan canvie la versio de l'aplicacio.
const CACHE = 'blocsjunior-v0.1.0';
const CORE = [
  './',
  'index.html',
  'home.html',
  'editor.html',
  'gettingstarted.html',
  'bundle.js',
  'sql-wasm.wasm',
  'settings.json',
  'media.json',
  'manifest.webmanifest',
  'icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('home.html'));
    })
  );
});
