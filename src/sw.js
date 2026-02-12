// sw.js

const CACHE_NAME = 'juris-counter-pwa-v3';
const urlsToCache = [
  '/',
  'index.html',
  'juris.js',
  'components/Counter.js',
  'db.js',
  'manifest.json',
  'icon.svg'
];

const POUCHDB_URL = 'https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js';

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cache local assets
        const localAssets = cache.addAll(urlsToCache);
        
        //Separately cache the cross-origin PouchDB script
        const pouchDBCache = fetch(POUCHDB_URL).then(response => {
          if (!response.ok) {
            throw new TypeError('Failed to fetch PouchDB');
          }
          return cache.put(POUCHDB_URL, response);
        });

        return Promise.all([localAssets, pouchDBCache]);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Skip caching for database proxy requests
  if (event.request.url.includes('/db-proxy')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request);
      })
  );
});
