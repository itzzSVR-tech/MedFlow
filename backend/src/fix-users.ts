import { supabase } from './config/supabase';

async function fixUsers() {
    console.log('--- User Fix-up ---');

    // Ensure knair9429@gmail.com is a doctor
    const { data: docUser, error: docErr } = await supabase
        .from('users')
        .update({ role: 'doctor' })
        .eq('email', 'knair9429@gmail.com')
        .select()
        .single();

    if (docErr) console.error('Failed to update doctor user:', docErr.message);
    else console.log('Fixed/Verified doctor user:', docUser.email);

    // Ensure karthiknair1610@gmail.com is an admin
    const { data: adminUser, error: adminErr } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('email', 'karthiknair1610@gmail.com')
        .select()
        .single();

    if (adminErr) console.error('Failed to update admin user:', adminErr.message);
    else console.log('Fixed/Verified admin user:', adminUser.email);

    // List all users again
    const { data: users } = await supabase.from('users').select('*');
    console.table(users);
}

fixUsers();
