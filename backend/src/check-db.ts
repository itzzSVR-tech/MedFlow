import { supabase } from './config/supabase';

async function checkDb() {
    console.log('--- Database Health Check ---');

    const { data: users, error: userError } = await supabase.from('users').select('*').limit(5);
    console.log('Users sample:', users?.length, 'records');
    if (userError) console.error('User Error:', userError);

    const { data: doctors, error: docError } = await supabase.from('doctors').select('*').limit(5);
    console.log('Doctors sample:', doctors?.length, 'records');
    if (docError) console.error('Doctor Error:', docError);

    const { data: apps, error: appError } = await supabase.from('appointments').select('*').limit(5);
    console.log('Appointments sample:', apps?.length, 'records');
    if (appError) console.error('Appointment Error:', appError);

    console.log('--- End of Check ---');
}

checkDb();
