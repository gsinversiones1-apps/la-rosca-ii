// sw.js - CONNEXAS Offline-First Architecture

const CACHE_NAME = 'connexas-app-cache-v7';
const DATA_CACHE = 'connexas-data-cache-v7';

// 1. Archivos críticos que siempre deben funcionar offline
const ASSETS_A_CACHEAR = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// 2. INSTALACIÓN
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activar el nuevo SW inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching recursos esenciales de la UI');
      return cache.addAll(ASSETS_A_CACHEAR);
    })
  );
});

// 3. ACTIVACIÓN Y LIMPIEZA DE CACHÉ VIEJO
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
            console.log('[Service Worker] Limpiando versión de caché obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 4. INTERCEPCIÓN DE PETICIONES (FETCH)
self.addEventListener('fetch', (event) => {
  // Ignorar POST/PUT y extensiones de Chrome
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  // RUTAS DE API Y BASE DE DATOS (Network First, fallback a Caché)
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clon = response.clone();
          caches.open(DATA_CACHE).then(cache => cache.put(event.request, clon));
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Red caída. Sirviendo API desde caché.');
          return caches.match(event.request);
        })
    );
    return;
  }

  // CACHE DE EXPERIENCIA 3D (Cache First para archivos pesados de Spline)
  if (event.request.url.includes('spline.design')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] Sirviendo modelo 3D desde caché');
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          const clon = networkResponse.clone();
          caches.open(DATA_CACHE).then(cache => cache.put(event.request, clon));
          return networkResponse;
        });
      })
    );
    return;
  }

  // RUTAS DE UI/ASSETS ESTÁTICOS (Cache First, fallback a Red)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        const clon = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clon));
        return networkResponse;
      });
    }).catch(() => {
      // Si falla todo y el usuario intentaba navegar, devuélvelo al inicio offline
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// 5. BACKGROUND SYNC (Cola para reconexión de Facturación/POS)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Evento Background Sync disparado:', event.tag);
  
  if (event.tag === 'sync-sales') {
    event.waitUntil(sincronizarOperacionesPendientes());
  }
});

// Lógica de sincronización diferida
async function sincronizarOperacionesPendientes() {
  console.log('[Service Worker] 📡 Procesando cola de operaciones locales...');
  try {
    // Buscar si hay ventanas (clientes) abiertas de la app
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    
    if (clients && clients.length > 0) {
      // Si la app está abierta, delegar la sincronización al SyncManager de la UI
      // Esto es seguro porque la UI ya tiene instanciado Supabase y la lógica compleja
      console.log('[Service Worker] Aplicación abierta detectada. Delegando sync al SyncManager.');
      clients.forEach(client => {
        client.postMessage({ type: 'TRIGGER_SYNC' });
      });
      console.log('[Service Worker] ✅ Mensaje TRIGGER_SYNC enviado a los clientes.');
    } else {
      console.log('[Service Worker] No hay ventanas abiertas. El SyncManager se encargará al abrir la app.');
    }
  } catch (error) {
    console.error('[Service Worker] ❌ Fallo durante delegación de sincronización.', error);
    throw error;
  }
}
