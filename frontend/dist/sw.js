const CACHE_NAME = 'phonix-music-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/favicon.ico',
    '/icons/Phonix192x192.png',
    '/icons/Phonix512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('fetch', event => {
    // For navigation requests (like index.html / page loads), try network first, fallback to cache
    if (event.request.mode === 'navigate' || 
        (event.request.method === 'GET' && event.request.headers.get('accept')?.includes('text/html'))) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For static files and assets, try cache first, fallback to network
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(netResponse => {
                    // Do not cache API endpoints, Firestore requests, or external service calls
                    const url = event.request.url;
                    if (netResponse.status === 200 && 
                        !url.includes('/search') && 
                        !url.includes('/add') && 
                        !url.includes('/status') && 
                        !url.includes('/download') && 
                        !url.includes('/lyrics') &&
                        !url.includes('firebase') &&
                        url.startsWith(self.location.origin)) {
                        const responseClone = netResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return netResponse;
                });
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
        }).then(() => self.clients.claim()) // Claim clients immediately
    );
});
