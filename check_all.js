require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkAll() {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) console.error(error);
    else {
        console.log('Total productos in DB:', data.length);
        const tenants = [...new Set(data.map(p => p.tenant_id))];
        console.log('Tenants found:', tenants);
    }
}

checkAll();
