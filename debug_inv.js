require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debug() {
    console.log('--- Debugging Inventory ---');
    const { data, error } = await supabase.from('Inventory').select('*').limit(1);
    if (error) {
        console.log('Error Inventory:', error.message);
        console.log('Hint:', error.hint);
    } else {
        console.log('Success Inventory! Data:', data);
    }
}

debug();
