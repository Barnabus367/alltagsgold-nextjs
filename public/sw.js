/**
 * Service Worker für AlltagsGold PWA
 * Offline-Funktionalität, Caching und Background Sync
 */

const CACHE_NAME = 'alltagsgold-v1';
const STATIC_CACHE = 'alltagsgold-static-v1';
const DYNAMIC_CACHE = 'alltagsgold-dynamic-v1';
const IMAGE_CACHE = 'alltagsgold-images-v1';

// Assets die immer gecacht werden sollen
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/app.css',
  '/_next/static/js/app.js'
];

// Strategien für verschiedene Request-Typen
const CACHE_STRATEGIES = {
  documents: 'networkFirst',
  scripts: 'cacheFirst', 
  styles: 'cacheFirst',
  images: 'cacheFirst',
  fonts: 'cacheFirst',
  api: 'networkFirst'
};

// Service Worker Installation
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('📦 Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('📦 Service Worker installation failed:', error);
      })
  );
});

// Service Worker Activation
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('🚀 Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch Event Handler mit intelligenten Caching-Strategien
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests und Chrome Extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Route zu entsprechender Cache-Strategie
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticAssetRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// API Requests: Network First mit Background Sync
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Versuche Network Request
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      // Cache successful response
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📡 Network failed for API, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical API calls
    if (request.url.includes('/cart') || request.url.includes('/checkout')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Du bist offline. Bitte versuche es später erneut.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Image Requests: Cache First mit Offline Fallback
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the image
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🖼️ Image load failed, using placeholder:', request.url);
    
    // Return placeholder for offline images
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280">Bild offline nicht verfügbar</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Document Requests: Network First mit Offline Page
async function handleDocumentRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📄 Document load failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await cache.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline HTML
    return new Response(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - AlltagsGold</title>
        <style>
          body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background: #f9fafb; }
          .container { max-width: 400px; margin: 0 auto; }
          h1 { color: #059669; margin-bottom: 20px; }
          p { color: #6b7280; line-height: 1.6; }
          button { background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌐 Du bist offline</h1>
          <p>Bitte überprüfe deine Internetverbindung und versuche es erneut.</p>
          <button onclick="window.location.reload()">Erneut versuchen</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Static Assets: Cache First
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Dynamic Requests: Network First
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background Sync für Offline Actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncOfflineCartActions());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncOfflineAnalytics());
  }
});

// Sync Offline Cart Actions
async function syncOfflineCartActions() {
  try {
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db);
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        // Remove from offline storage after successful sync
        await removeOfflineAction(db, action.id);
        console.log('✅ Synced offline cart action:', action.id);
      } catch (error) {
        console.error('❌ Failed to sync cart action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Cart sync failed:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('📲 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Angebote verfügbar!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Öffnen',
        icon: '/icons/open-action.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/icons/close-action.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AlltagsGold', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('📲 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// IndexedDB Helper Functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('alltagsgold-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offlineActions')) {
        const store = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getOfflineActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Performance Monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ Service Worker loaded successfully');
