import { supabase } from './config/supabase';

async function listTables() {
    console.log('--- Table List ---');
    const { data, error } = await supabase.rpc('get_tables'); // Custom RPC if it exists
    if (error) {
        // Fallback to querying pg_catalog via raw SQL if supported or just trying a known table
        const { data: beds, error: bedsError } = await supabase.from('beds').select('*').limit(1);
        if (bedsError) {
            console.error('Beds Table Error:', bedsError.message);
        } else {
            console.log('Beds table exists and has', beds?.length, 'sample records.');
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
