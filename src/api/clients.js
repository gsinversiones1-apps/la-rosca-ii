/**
 * API para la gestión de Clientes con resiliencia ante esquema de base de datos
 */
import { supabase } from './supabaseClient.js';

export const getClients = async () => {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('first_name', { ascending: true });
    
    if (error) throw error;
    return data;
};

export const createClient = async (clientData) => {
    const payload = {
        first_name: clientData.nombre || '',
        last_name: clientData.apellido || '',
        tax_id: clientData.rif || clientData.cedula || '',
        address: clientData.direccion || null,
        phone_number: clientData.telefono || null
    };
    if (clientData.id) {
        payload.id = clientData.id;
    }

    // Intentamos guardar con el campo 'telefono'
    const { data, error } = await supabase
        .from('clientes')
        .upsert([payload], { onConflict: 'tax_id' })
        .select();
    
    if (error) {
        // Fallback: si el campo 'telefono' no existe en la base de datos, reintentamos sin él
        if (error.message.includes('phone_number') || error.code === '42703') {
            console.warn('[createClient] La columna "phone_number" no existe en la base de datos. Reintentando sin ella...');
            const fallbackPayload = { ...payload };
            delete fallbackPayload.phone_number;
            
            const { data: retryData, error: retryError } = await supabase
                .from('clientes')
                .upsert([fallbackPayload], { onConflict: 'tax_id' })
                .select();
                
            if (retryError) {
                console.error('[createClient Fallback] Error:', retryError.message);
                throw retryError;
            }
            return retryData[0];
        }
        console.error('[createClient] Error:', error.message);
        throw error;
    }
    return data[0];
};

export const deleteClient = async (id) => {
    const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
    return true;
};
