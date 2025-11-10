const CACHE_NAME = 'partner-connector-v2';
const urlsToCache = [
  '/',
  '/offline',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('Cache addAll failed:', err);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip chrome-extension and non-http(s) requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // If both cache and network fail, show offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline');
        }
      })
  );
});

// Background sync for failed requests and offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-requests' || event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PartnerConnectorDB', 1);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onupgradeneeded = (event) => {
      // DB will be created by the main app, just skip if needed
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        // Basic structure if needed
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    };
  });
}

// Helper to get all items from a store
function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Helper to remove item from sync queue
function removeFromSyncQueue(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(itemId);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function syncOfflineData() {
  console.log('Starting background sync...');
  
  try {
    // Open IndexedDB to get pending sync items
    const db = await openIndexedDB();
    if (!db) {
      console.log('Could not open IndexedDB for sync');
      return;
    }
    
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const syncItems = await getAllFromStore(store);
    
    console.log(`Found ${syncItems.length} items to sync`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Process each sync item
    for (const item of syncItems) {
      try {
        // Determine the API endpoint based on entity type
        let endpoint = '';
        let method = item.action.toUpperCase();
        
        switch (item.entity) {
          case 'referral':
            endpoint = '/api/referrals';
            if (item.action !== 'create' && item.entityId) {
              endpoint += `/${item.entityId}`;
            }
            if (item.action === 'delete') method = 'DELETE';
            else if (item.action === 'update') method = 'PATCH';
            else method = 'POST';
            break;
          case 'notification':
            endpoint = `/api/notifications/${item.entityId}`;
            method = 'PATCH';
            break;
          case 'user':
            endpoint = '/api/auth/user';
            method = 'PATCH';
            break;
        }
        
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: method !== 'DELETE' ? JSON.stringify(item.data) : undefined,
            credentials: 'include'
          });
          
          if (response.ok) {
            // Remove from sync queue
            await removeFromSyncQueue(db, item.id);
            successCount++;
            console.log(`Synced item ${item.id} successfully`);
          } else {
            failCount++;
            console.error(`Failed to sync item ${item.id}: ${response.status}`);
          }
        }
      } catch (err) {
        failCount++;
        console.error(`Error syncing item ${item.id}:`, err);
      }
    }
    
    console.log(`Sync complete: ${successCount} succeeded, ${failCount} failed`);
    
    // Notify the app about sync completion
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { successCount, failCount }
      });
    });
    
  } catch (err) {
    console.error('Background sync failed:', err);
  }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification support
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'PartnerConnector',
    body: 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'default',
    requireInteraction: false,
    data: {},
    actions: []
  };

  // Parse push notification data
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction || notificationData.requireInteraction,
        data: payload.data || notificationData.data,
        actions: payload.actions || notificationData.actions,
        vibrate: payload.vibrate || [100, 50, 100],
        timestamp: payload.timestamp || Date.now()
      };
    } catch (err) {
      console.error('Failed to parse push notification data:', err);
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: notificationData.vibrate,
      timestamp: notificationData.timestamp
    })
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle action clicks
  if (event.action) {
    switch (event.action) {
      case 'view':
        // Open the relevant page based on notification type
        const url = event.notification.data?.url || '/dashboard';
        event.waitUntil(
          clients.openWindow(url)
        );
        break;
      case 'dismiss':
        // Just close the notification
        break;
      default:
        console.log('Unknown action:', event.action);
    }
  } else {
    // Handle notification body click
    let targetUrl = '/dashboard';
    
    // Determine URL based on notification type
    if (event.notification.data) {
      const { type, referralId, url } = event.notification.data;
      
      if (url) {
        targetUrl = url;
      } else if (type === 'commission_approval' && referralId) {
        targetUrl = `/dashboard?highlight=${referralId}`;
      } else if (type === 'quote_ready' && referralId) {
        targetUrl = `/dashboard?quote=${referralId}`;
      } else if (type === 'status_update' && referralId) {
        targetUrl = `/dashboard?referral=${referralId}`;
      }
    }

    // Open or focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if the app is already open
          for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
              return client.focus();
            }
          }
          // If not, open a new window
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
    );
  }
});

// Handle notification close events (optional - for analytics)
self.addEventListener('notificationclose', (event) => {
  // Could send analytics about notification being dismissed
  console.log('Notification closed:', event.notification.tag);
});