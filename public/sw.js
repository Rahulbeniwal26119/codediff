const CACHE_NAME = 'codediff-v1';
const STATIC_CACHE_NAME = 'codediff-static-v1';
const API_CACHE_NAME = 'codediff-api-v1';

// Assets to cache on install
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    // Add other critical assets
];

// API endpoints to cache
const apiEndpoints = [
    '/api/code-diff',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE_NAME)
                .then((cache) => cache.addAll(urlsToCache)),
            caches.open(API_CACHE_NAME)
        ])
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== API_CACHE_NAME && 
                        cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests with network-first strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            networkFirstStrategy(request, API_CACHE_NAME)
        );
        return;
    }

    // Handle static assets with cache-first strategy
    if (request.destination === 'script' || 
        request.destination === 'style' || 
        request.destination === 'image') {
        event.respondWith(
            cacheFirstStrategy(request, STATIC_CACHE_NAME)
        );
        return;
    }

    // Handle navigation requests with network-first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            networkFirstStrategy(request, CACHE_NAME)
        );
        return;
    }

    // Default: try network first, fallback to cache
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// Network-first caching strategy
async function networkFirstStrategy(request, cacheName) {
    try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return a fallback response for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/');
        }
        
        throw error;
    }
}

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then((response) => {
            if (response.status === 200) {
                const cache = caches.open(cacheName);
                cache.then((c) => c.put(request, response));
            }
        }).catch(() => {
            // Ignore network errors for background updates
        });
        
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle any pending offline actions
    // This could include saving diffs, analytics, etc.
    console.log('Background sync triggered');
}