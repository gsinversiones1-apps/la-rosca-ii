import { supabase } from '../api/supabaseClient.js';
import { getPendingSales, removePendingSale } from './db.js';

let isSyncing = false;

// Función auxiliar para esperar
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const processSyncQueue = async () => {
    if (isSyncing || !navigator.onLine) {
        console.log('[SyncManager] Omitiendo sincronización. Sync en curso o no hay red.');
        return;
    }

    try {
        isSyncing = true;
        const pendingSales = await getPendingSales();
        
        if (pendingSales.length === 0) {
            isSyncing = false;
            return;
        }

        console.log(`[SyncManager] Iniciando sincronización de ${pendingSales.length} ventas pendientes...`);
        
        // Ordenar por fecha de más antigua a más reciente para preservar consistencia
        pendingSales.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        let backoffDelay = 1000; // Iniciar con 1 segundo de espera entre envíos exitosos

        for (const sale of pendingSales) {
            if (!navigator.onLine) {
                console.warn('[SyncManager] Se perdió la conexión durante la sincronización.');
                break; // Cortar si se pierde la red
            }

            try {
                console.log(`[SyncManager] Subiendo venta ${sale.local_id}...`);
                
                // 1. Preparar payload (quitando propiedades locales)
                const payload = { ...sale };
                const localId = payload.local_id;
                delete payload.local_id;
                delete payload.id; // Remover el ID temporal 'OFFLINE-xxx'
                delete payload.status;
                delete payload.timestamp;

                // 2. Insertar en Supabase
                const { data, error } = await supabase
                    .from('ventas')
                    .insert([payload])
                    .select();

                if (error) throw error;

                // 3. Sincronizar Stock en el Servidor
                // Ya lo descontamos localmente, ahora le avisamos al backend central
                for (const item of payload.items) {
                    const { error: stockError } = await supabase.rpc('decrement_stock', {
                        row_id: item.id,
                        count: item.cantidad
                    });
                    if (stockError) {
                        console.error(`[SyncManager] Error bajando stock en servidor para ${item.id}:`, stockError);
                        // No abortamos la venta si falla el stock, la venta ya se registró.
                    }
                }

                // 4. Éxito: Remover de IndexedDB
                await removePendingSale(localId);
                console.log(`[SyncManager] ✓ Venta ${localId} sincronizada con éxito.`);
                
                // Disparar actualización de UI para ir bajando el contador 1 a 1
                window.dispatchEvent(new CustomEvent('sync-queue-updated'));

                // Pacing: Esperar antes del siguiente envío para no saturar red
                await delay(backoffDelay);

            } catch (err) {
                // Falla Atómica: Se queda en la cola
                console.error(`[SyncManager] ❌ Fallo sincronizando venta ${sale.local_id}:`, err.message || err);
                if (err.details) console.error(`[Detalles Supabase]:`, err.details);
                if (err.hint) console.error(`[Pista Supabase]:`, err.hint);
                
                // Exponential Backoff para errores: duplicar tiempo de espera si hay error (max 16s)
                backoffDelay = Math.min(backoffDelay * 2, 16000);
                console.log(`[SyncManager] Aplicando backoff. Esperando ${backoffDelay}ms antes de intentar la siguiente...`);
                await delay(backoffDelay);
            }
        }

    } catch (globalError) {
        console.error('[SyncManager] Error crítico en la rutina de sincronización:', globalError);
    } finally {
        isSyncing = false;
        console.log('[SyncManager] Rutina de sincronización finalizada.');
        // Un último refresh a la UI
        window.dispatchEvent(new CustomEvent('sync-queue-updated'));
    }
};

// Escuchar evento online para auto-disparar sincronización
window.addEventListener('online', () => {
    console.log('[SyncManager] ¡Conexión restaurada! Activando Sync Queue en 3 segundos...');
    setTimeout(processSyncQueue, 3000); // Pequeña espera para asegurar estabilidad de red
});

// Listener para el mensaje del Service Worker
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'TRIGGER_SYNC') {
        console.log('[SyncManager] Solicitud de Sync recibida desde Service Worker.');
        processSyncQueue();
    }
});
