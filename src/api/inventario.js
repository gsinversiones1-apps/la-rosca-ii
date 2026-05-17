import { supabase } from './supabaseClient.js';

/**
 * Busca tornillos en el inventario utilizando búsqueda de texto completo (.textSearch).
 * 
 * SEGURIDAD: No filtramos manualmente por tenant_id aquí porque el sistema utiliza
 * Row Level Security (RLS) en Supabase. El tenant_id se extrae automáticamente
 * del token JWT del usuario autenticado (Carlos), garantizando que nunca vea
 * los tornillos de otros comercios.
 * 
 * @param {string} query - Término de búsqueda (ej: "hexagonal 2 pulgadas")
 * @returns {Promise<Array>} - Resultados que coinciden con la búsqueda
 */
export const buscarTornillos = async (query) => {
    if (!query || query.trim() === '') return [];

    // Limpiamos la query para evitar errores de sintaxis en el buscador
    const formattedQuery = query.trim();

    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .textSearch('buscador', formattedQuery, {
            config: 'spanish',
            type: 'websearch'
        });

    if (error) {
        console.error('Error buscando tornillos en Supabase:', error.message);
        throw error;
    }

    return data;
};

/**
 * Obtiene todo el inventario disponible para el comercio actual.
 * El filtrado por tenant_id ocurre a nivel de base de datos vía RLS.
 */
export const getInventario = async () => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error obteniendo inventario:', error.message);
        throw error;
    }

    return data;
};
