import { supabase } from './supabaseClient.js';

/**
 * Fetch BI Dashboard data from Supabase via RPC.
 * @returns {Promise<Object>} The dashboard JSON payload containing kpis and insights.
 */
export const getDashboardData = async () => {
    const { data, error } = await supabase.rpc('get_dashboard_bi');
    
    if (error) {
        console.error('Error fetching dashboard data:', error.message);
        throw error;
    }
    
    return data;
};
