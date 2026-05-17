require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const demoProducts = [
    {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        nombre: 'Tornillo Allen Cilíndrico 1/4 x 1',
        codigo_skv: 'ALL-001',
        precio_usd: 0.25,
        stock: 500,
        area: 'Allen',
        medida: '1/4 x 1'
    },
    {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        nombre: 'Tornillo Drywall 6 x 1',
        codigo_skv: 'DRY-002',
        precio_usd: 0.05,
        stock: 1000,
        area: 'Drywall',
        medida: '6 x 1'
    },
    {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        nombre: 'Arandela de Presión 3/8',
        codigo_skv: 'ARA-003',
        precio_usd: 0.10,
        stock: 45, // Stock bajo para probar alerta
        area: 'General',
        medida: '3/8'
    }
];

async function seed() {
    console.log('Sembrando productos de demo...');
    const { data, error } = await supabase.from('productos').insert(demoProducts);
    if (error) {
        console.error('Error al sembrar:', error.message);
    } else {
        console.log('✅ Productos demo creados exitosamente.');
    }
}

seed();
