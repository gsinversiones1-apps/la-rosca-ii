/**
 * API para la gestión de Clientes
 */
import { supabase } from './supabaseClient.js';
import { GlobalState } from '../context/State.js';

export const getClients = async () => {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('tenant_id', GlobalState.myTenantId)
        .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
};

export const createClient = async (clientData) => {
    const payload = {
        nombre: clientData.nombre || '',
        apellido: clientData.apellido || '',
        cedula: clientData.rif || clientData.cedula || '',
        direccion: clientData.direccion || null,
        tenant_id: GlobalState.myTenantId
    };

    // Usar upsert: si ya existe la cédula, actualiza y retorna el registro
    const { data, error } = await supabase
        .from('clientes')
        .upsert([payload], { onConflict: 'cedula' })
        .select();
    
    if (error) {
        console.error('[createClient] Error:', error.message);
        throw error;
    }
    return data[0];
};
