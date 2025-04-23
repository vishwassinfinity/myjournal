const CACHE_NAME = 'myjournal-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/sounds/rain.mp3',
  '/sounds/forest.mp3',
  '/sounds/cafe.mp3',
  '/sounds/fire.mp3',
  '/sounds/waves.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Don't cache API responses or external resources
        if (
          !event.request.url.startsWith(self.location.origin) ||
          event.request.url.includes('/api/')
        ) {
          return response;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Return a fallback for offline pages
      return caches.match('/');
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
}); 