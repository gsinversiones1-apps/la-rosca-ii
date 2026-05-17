import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://lwqveehmndygrxlwathe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cXZlZWhtbmR5Z3J4bHdhdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDk4NTUsImV4cCI6MjA5MTA4NTg1NX0.rpvqyq6UHgEeHWqyvAYJxgvtGpURKJItXvGri2B0tY4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Función genérica para obtener productos por Tenant
 */
export const getProductsByTenant = async (tenantId) => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
};
