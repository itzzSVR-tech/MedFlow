import { supabase } from './config/supabase';
import fs from 'fs';

async function checkProfiles() {
    console.log('--- Profile Depth Check ---');

    const { data: doctors } = await supabase.from('doctors').select('*');
    const { data: patients } = await supabase.from('patients').select('*');

    const results = {
        doctors,
        patients
    };

    fs.writeFileSync('profile_check_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to profile_check_results.json');
}

checkProfiles();
