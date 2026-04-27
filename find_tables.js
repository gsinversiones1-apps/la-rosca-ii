require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function findAnyTable() {
    // Try to guess based on common patterns
    const patterns = ['Inventory', 'inventory', 'POS', 'pos', 'Sales', 'sales', 'Ventas', 'ventas', 'Productos', 'productos', 'items', 'Items', 'Stock', 'stock'];
    for (const p of patterns) {
        const { data, error } = await supabase.from(p).select('*').limit(1);
        if (!error) {
            const { count } = await supabase.from(p).select('*', { count: 'exact', head: true });
            console.log(`Found table: ${p} | Count: ${count}`);
        }
    }
}

findAnyTable();
