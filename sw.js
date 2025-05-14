const CACHE_NAME = 'keyboard-king-cache-v2'; // تم تحديث الإصدار لتجديد الكاش
const URLS_TO_CACHE = [
    'home.html',
    'game.html',
    // لا حاجة لـ style.css أو script_game.js هنا لأنهما مدمجان
    'manifest.json',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch(err => {
                console.error('Failed to cache resources during install:', err);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.error("Fetching failed:", error);
                    // يمكنك هنا إرجاع صفحة خطأ مخصصة إذا كنت قد أنشأتها وخزنتها مؤقتًا
                    // return caches.match('/offline.html'); 
                });
            })
    );
});
