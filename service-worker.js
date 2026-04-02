const CACHE_NAME = 'quran-player-v3';
const AUDIO_CACHE = 'quran-audio-v2';

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

// Helper function to create a range response from a full cached response
async function createRangeResponse(request, cachedResponse) {
  const rangeHeader = request.headers.get('range');
  
  if (!rangeHeader) {
    return cachedResponse;
  }

  const arrayBuffer = await cachedResponse.arrayBuffer();
  const bytes = /^bytes=(\d+)-(\d+)?$/.exec(rangeHeader);
  
  if (!bytes) {
    return cachedResponse;
  }

  const start = parseInt(bytes[1], 10);
  const end = bytes[2] ? parseInt(bytes[2], 10) : arrayBuffer.byteLength - 1;
  const slicedBuffer = arrayBuffer.slice(start, end + 1);

  return new Response(slicedBuffer, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Range': `bytes ${start}-${end}/${arrayBuffer.byteLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': slicedBuffer.byteLength,
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mpeg'
    }
  });
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle audio files (MP3s from archive.org)
  if (url.hostname === 'archive.org' && request.url.endsWith('.mp3')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(AUDIO_CACHE);
        
        // Try to find cached full response (non-range request)
        const fullRequest = new Request(request.url, {
          headers: new Headers()
        });
        
        const cachedResponse = await cache.match(fullRequest);
        
        if (cachedResponse) {
          console.log('[Service Worker] Serving audio from cache:', request.url);
          return createRangeResponse(request, cachedResponse.clone());
        }

        // Not in cache, fetch from network
        try {
          // Always fetch the full file (without range header) for caching
          const fullFetchRequest = new Request(request.url, {
            headers: new Headers()
          });
          
          const networkResponse = await fetch(fullFetchRequest);

          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            console.log('[Service Worker] Caching new audio:', request.url);
            
            // Clone for cache
            cache.put(fullRequest, networkResponse.clone());
            
            // Return appropriate response (range or full)
            return createRangeResponse(request, networkResponse);
          }
          
          return networkResponse;
        } catch (error) {
          console.error('[Service Worker] Audio fetch failed:', error);
          throw error;
        }
      })()
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
      const request = new Request(audioUrl, {
        headers: new Headers()
      });
      
      fetch(request).then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response);
          console.log('[Service Worker] Manually cached audio:', audioUrl);
        }
      });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE).then(() => {
      console.log('[Service Worker] Audio cache cleared');
      caches.open(AUDIO_CACHE);
    });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.open(AUDIO_CACHE).then((cache) => {
      cache.keys().then((keys) => {
        event.source.postMessage({
          type: 'CACHE_SIZE',
          count: keys.length
        });
      });
    });
  }
});
