const CACHE = 'math-lab-v5';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './questions.json',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
];
// Note: Google Fonts (fonts.googleapis.com / fonts.gstatic.com) are not cached
// here; the browser falls back to the system font if they are unavailable offline.

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
