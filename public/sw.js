const CACHE_NAME = 'my-audio-g-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
  '/offline.en.html',
  '/offline.it.html',
  '/_next/static/*',
];

// Simple helpers
function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return null;
        }),
      ),
    ),
  );
  self.clients.claim();
});

const AUDIO_CACHE = 'audio-cache-v1';

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Navigation requests - network first, fallback to cache
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Update the cache asynchronously
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        } catch (err) {
          // On failure return cached page or localized offline page
          const cached = await caches.match(request);
          if (cached) return cached;
          return getLocalizedOfflineResponse();
        }
      })(),
    );
    return;
  }

  // Audio assets: cache-first from a separate audio cache
  if (request.destination === 'audio' || request.url.match(/\.(mp3|wav|m4a|ogg)(\?.*)?$/i)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) cache.put(request, response.clone());
              return response;
            })
            .catch(() => {
              // If audio isn't cached and can't be fetched, fail gracefully
              return new Response(null, { status: 503, statusText: 'Audio unavailable offline' });
            });
        }),
      ),
    );
    return;
  }

  // For other static assets - cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Only cache successful GET responses
          if (
            request.method === 'GET' &&
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Optionally return a fallback image for images
          if (request.destination === 'image') return caches.match('/icon-192.png');
          return getLocalizedOfflineResponse();
        });
    }),
  );
});

// Read cached '/offline.lang' to determine which localized offline page to serve
async function getLocalizedOfflineResponse() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const langResp = await cache.match('/offline.lang');
    let lang = 'it';
    if (langResp) {
      const txt = await langResp.text();
      if (txt) lang = txt.trim();
    }

    // try localized html
    const localized = `/offline.${lang}.html`;
    const match = await caches.match(localized);
    if (match) return match;

    // fallback to generic offline.html
    const fallback = await caches.match('/offline.html');
    if (fallback) return fallback;

    // nothing cached — return a minimal response
    return new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  } catch (e) {
    return new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
}

// Listen for skipWaiting message to activate new SW immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
