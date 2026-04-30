/**
 * API para la gestión de Ventas
 */
import { supabase } from './supabaseClient.js';
import { GlobalState } from '../context/State.js';
import { enqueueSale, saveProductsLocal } from '../utils/db.js';

export const saveSale = async (saleData) => {
    // Schema real de la tabla 'ventas':
    // id, producto_id, cantidad, tasa_dia, total_bs, fecha_venta, tenant_id

    // La venta se guarda como N filas, una por producto en el carrito
    const rows = saleData.items.map(item => ({
        tenant_id: GlobalState.myTenantId,
        producto_id: item.id,
        cantidad: item.cantidad,
        tasa_dia: GlobalState.tasaActual,
        total_bs: item.precio_usd * item.cantidad * GlobalState.tasaActual,
        fecha_venta: new Date().toISOString()
    }));

    let savedSale = null;
    let isOffline = !navigator.onLine;

    // 1. Intentar registrar online
    if (!isOffline) {
        try {
            const { data, error: saleError } = await supabase
                .from('ventas')
                .insert(rows)
                .select();

            if (saleError) throw saleError;
            savedSale = data;

        } catch (error) {
            console.warn('Fallo guardando online, cambiando a offline mode', error);
            isOffline = true;
        }
    }

    // 2. Fallback Offline: Guardar en Sync Queue (IndexedDB)
    if (isOffline) {
        console.log('Guardando venta en Sync Queue local...');
        salePayload.id = 'OFFLINE-' + Date.now(); // ID temporal
        await enqueueSale(salePayload);
        savedSale = salePayload;

        // Intentar registrar el evento Background Sync si el Service Worker lo soporta
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-sales');
            } catch (err) {
                console.log('Background Sync no soportado o falló', err);
            }
        }
    }

    // 3. Descontar Stock Localmente (En memoria e IndexedDB)
    // Esto asegura que el vendedor no venda lo que ya no tiene estando offline
    let stockChanged = false;
    saleData.items.forEach(saleItem => {
        const productIndex = GlobalState.allProducts.findIndex(p => p.id === saleItem.id);
        if (productIndex !== -1) {
            GlobalState.allProducts[productIndex].stock -= saleItem.cantidad;
            stockChanged = true;
        }
    });

    if (stockChanged) {
        await saveProductsLocal(GlobalState.allProducts);
        // Despachamos un evento para que la UI se entere que el stock cambió (si fuera necesario)
        window.dispatchEvent(new CustomEvent('local-stock-updated'));
    }

    // Disparar evento para actualizar el badge de Sync Queue
    window.dispatchEvent(new CustomEvent('sync-queue-updated'));

    return savedSale;
};
