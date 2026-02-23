const CACHE_NAME = 'quran-player-v2';
const AUDIO_CACHE = 'quran-audio-v1';

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/media-player/',
  '/media-player/index.html',
  '/media-player/player.js',
  '/media-player/playlist-data.js',
  '/media-player/bismillah-logo-new.webp',
  '/media-player/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle audio files (MP3s from archive.org)
  if (url.hostname === 'archive.org' && request.url.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            console.log('[Service Worker] Serving audio from cache:', request.url);
            return response;
          }

          // Not in cache, fetch from network and cache it
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              console.log('[Service Worker] Caching new audio:', request.url);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('[Service Worker] Audio fetch failed:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Handle static assets (HTML, CSS, JS, images)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return response;
      }

      // Not in cache, fetch from network
      return fetch(request).then((networkResponse) => {
        // Cache static assets on the fly
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        // Could return a custom offline page here
        throw error;
      });
    })
  );
});

// Message handler for manual cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    const audioUrl = event.data.url;
    
    caches.open(AUDIO_CACHE).then((cache) => {
      fetch(audioUrl).then((response) => {
        if (response && response.status === 200) {
          cache.put(audioUrl, response);
          console.log('[Service Worker] Manually cached audio:', audioUrl);
        }
      });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE).then(() => {
      console.log('[Service Worker] Audio cache cleared');
      caches.open(AUDIO_CACHE); // Recreate empty cache
    });
  }
});
