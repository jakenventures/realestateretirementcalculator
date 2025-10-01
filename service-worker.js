// Service Worker for offline functionality and performance enhancement
// Provides shell caching and offline access to core app functionality

const CACHE_NAME = 'real-estate-calculator-v1';
const STATIC_CACHE_NAME = 'real-estate-static-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/404.html',
    '/css/theme.css',
    '/css/base.css',
    '/js/calculator.js',
    '/js/charts.js',
    '/js/seo.js',
    '/js/router.js',
    '/js/pages.js',
    '/js/forms.js',
    '/public/icons/favicon.ico',
    '/public/icons/apple-touch-icon.png',
    '/robots.txt',
    '/sitemap.xml'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell and static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip Chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache successful responses (optional - only for static assets)
                        if (event.request.url.includes('/css/') ||
                            event.request.url.includes('/js/') ||
                            event.request.url.includes('/public/')) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // Network failed, check if we can serve a fallback
                        if (event.request.destination === 'document') {
                            // Return cached index.html for navigation requests
                            return caches.match('/index.html');
                        }

                        // No fallback available
                        return new Response('Offline content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Handle background sync for form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-form-sync') {
        event.waitUntil(syncOfflineForms());
    }
});

// Sync stored form submissions
async function syncOfflineForms() {
    try {
        const stored = JSON.parse(localStorage.getItem('offline_lead_submissions') || '[]');

        for (const submission of stored) {
            try {
                const response = await fetch('https://api.getloanterms.com/leads', { // Replace with actual endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submission)
                });

                if (response.ok) {
                    // Remove successfully submitted entry
                    stored.splice(stored.indexOf(submission), 1);
                }
            } catch (error) {
                console.log('Failed to sync submission:', error);
            }
        }

        // Update stored submissions
        localStorage.setItem('offline_lead_submissions', JSON.stringify(stored));

    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Handle push notifications (optional enhancement)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/public/icons/apple-touch-icon.png',
        badge: '/public/icons/favicon.ico',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
