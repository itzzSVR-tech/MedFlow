import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase URL or Service Role Key is missing in .env');
}

// Using SERVICE ROLE KEY to allow the backend full access (RLS bypass)
// Hospital isolation is enforced in the service layer using hospital_id filters.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
