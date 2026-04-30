const DB_NAME = 'connexas_db';
const DB_VERSION = 1;

/**
 * Inicializa la base de datos IndexedDB
 */
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject('Error abriendo IndexedDB');

        request.onsuccess = (event) => resolve(event.target.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('productos')) {
                db.createObjectStore('productos', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('clientes')) {
                db.createObjectStore('clientes', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('ventas_outbox')) {
                db.createObjectStore('ventas_outbox', { keyPath: 'local_id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('config')) {
                db.createObjectStore('config', { keyPath: 'key' });
            }
        };
    });
};

/**
 * Función genérica para guardar datos en un store
 */
const saveToStore = async (storeName, data, isArray = true) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        if (isArray) {
            store.clear(); // Limpiamos caché anterior
            data.forEach(item => store.put(item));
        } else {
            store.put(data);
        }

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject('Error guardando en store');
    });
};

/**
 * Función genérica para obtener datos de un store
 */
const getFromStore = async (storeName) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Error obteniendo del store');
    });
};

// API Expuesta
export const saveProductsLocal = (products) => saveToStore('productos', products);
export const getProductsLocal = () => getFromStore('productos');

export const saveClientsLocal = (clients) => saveToStore('clientes', clients);
export const getClientsLocal = () => getFromStore('clientes');

export const setConfigLocal = async (key, value) => saveToStore('config', { key, value }, false);
export const getConfigLocal = async (key) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('config', 'readonly');
        const request = transaction.objectStore('config').get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject('Error obteniendo config');
    });
};

// Cola de ventas
export const enqueueSale = async (saleData) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('ventas_outbox', 'readwrite');
        const store = transaction.objectStore('ventas_outbox');
        
        saleData.timestamp = new Date().toISOString();
        saleData.status = 'pending';
        
        const request = store.add(saleData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Error encolando venta');
    });
};

export const getPendingSales = () => getFromStore('ventas_outbox');

export const removePendingSale = async (localId) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('ventas_outbox', 'readwrite');
        const store = transaction.objectStore('ventas_outbox');
        const request = store.delete(localId);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject('Error eliminando venta encolada');
    });
};
