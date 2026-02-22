import { supabase } from './config/supabase';
import fs from 'fs';

async function checkUsers() {
    console.log('--- User Roles Check ---');
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, full_name, supabase_uid');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    fs.writeFileSync('user_check_results.json', JSON.stringify(users, null, 2));
    console.log('Results written to user_check_results.json');
}

checkUsers();
