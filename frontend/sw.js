/**
 * Sahayak Service Worker — PWA Offline Support
 * Cache-first for static assets, network-first for API
 */

const CACHE_NAME = 'sahayak-v2.0.0';
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/css/chat.css',
  '/static/js/app.js',
  '/static/js/chat.js',
  '/static/js/workers.js',
  '/static/js/analytics.js',
  '/static/index.html',
  '/static/chat.html',
  '/static/workers.html',
  '/static/analytics.html',
  '/static/sessions.html',
  '/static/disputes.html',
  '/static/fraud.html',
  '/static/settings.html',
  '/static/jobs.html',
  '/static/login.html',
];

const OFFLINE_FALLBACK = `
<!DOCTYPE html>
<html data-theme="dark">
<head>
  <meta charset="UTF-8">
  <title>Sahayak — Offline</title>
  <style>
    body { font-family: Inter, sans-serif; background: #0B0F1A; color: #F1F5F9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
    .container { max-width: 400px; padding: 40px; }
    h1 { color: #FF6B35; font-size: 32px; margin-bottom: 8px; }
    p { color: #94A3B8; margin-bottom: 24px; }
    button { background: linear-gradient(135deg, #FF6B35, #FF8C5A); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size:80px">📵</div>
    <h1>You're Offline</h1>
    <p>Sahayak needs an internet connection. Your messages have been queued and will be sent when you reconnect.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>
`;

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('/static/index.html')));
    }).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests for caching
  if (event.request.method !== 'GET') return;

  // API calls: network-first
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', cached: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Return offline page for HTML requests
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return new Response(OFFLINE_FALLBACK, {
            headers: { 'Content-Type': 'text/html' },
          });
        }
      });
    })
  );
});

// Background sync for queued messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncQueuedMessages());
  }
});

async function syncQueuedMessages() {
  // Notify clients to process their offline queue
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'sync-queue' }));
}
