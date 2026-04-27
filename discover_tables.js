require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function discover() {
    const targets = ['Inventory', 'inventory', 'Inventario', 'inventario', 'Products', 'products', 'Productos', 'productos'];
    console.log('Searching for the 50-item table...');
    
    for (const t of targets) {
        try {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (!error) {
                console.log(`Table "${t}" found. Count: ${count}`);
                if (count >= 40) { // Looking for the 50 items
                    console.log(`>>> MATCH FOUND: ${t} <<<`);
                }
            } else {
                // Try quoted
                const { count: c2, error: e2 } = await supabase.from(`"${t}"`).select('*', { count: 'exact', head: true });
                if (!e2) {
                    console.log(`Table ""${t}"" (quoted) found. Count: ${c2}`);
                    if (c2 >= 40) {
                        console.log(`>>> MATCH FOUND (Quoted): "${t}" <<<`);
                    }
                }
            }
        } catch (e) {}
    }
}

discover();
