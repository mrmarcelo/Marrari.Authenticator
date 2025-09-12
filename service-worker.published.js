// Prod SW – cache-first for assets, network-first for API
self.addEventListener('install', event => {
    event.waitUntil(caches.open('app-cache-v1').then(cache => cache.addAll(['./', 'index.html'])));
    self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isApi = url.pathname.startsWith('/activation') || url.pathname.startsWith('/device');
    if (isApi) return; // network only for API
    event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
            const copy = r.clone();
            caches.open('app-cache-v1').then(cache => cache.put(event.request, copy));
            return r;
        }))
    );
});
