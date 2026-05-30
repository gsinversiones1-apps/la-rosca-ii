import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://lwqveehmndygrxlwathe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cXZlZWhtbmR5Z3J4bHdhdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDk4NTUsImV4cCI6MjA5MTA4NTg1NX0.rpvqyq6UHgEeHWqyvAYJxgvtGpURKJItXvGri2B0tY4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
    if (error) throw error;
    return data;
};

/**
 * Función genérica para obtener productos por Tenant
 */
export const getProductsByTenant = async (tenantId) => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
};

/**
 * Inserta un nuevo producto en la base de datos (Admin)
 */
export const insertProduct = async (productData) => {
    // Generar ID único usando el timestamp para mock si es necesario, 
    // o dejar que Supabase lo asigne si es UUID
    const { data, error } = await supabase
        .from('productos')
        .insert([productData])
        .select();

    if (error) throw error;
    return data;
};

/**
 * Actualiza un producto existente en la base de datos
 */
export const updateProduct = async (productId, productData) => {
    const { data, error } = await supabase
        .from('productos')
        .update(productData)
        .eq('id', productId)
        .select();

    if (error) throw error;
    return data;
};

/**
 * Inserta una nueva orden de compra en la base de datos
 */
export const insertPurchaseOrder = async (orderData) => {
    const { data, error } = await supabase
        .from('ordenes_compra')
        .insert([orderData])
        .select();

    if (error) throw error;
    return data;
};
