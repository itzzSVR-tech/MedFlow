import { supabase } from '../config/supabase';

export class OnboardingService {
    static async ensureUser(supabaseUser: any) {
        console.log('[ONBOARDING] Ensuring profile for:', supabaseUser.email);

        // 1. Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('supabase_uid', supabaseUser.id)
            .maybeSingle();

        if (fetchError) {
            console.error('[ONBOARDING ERROR] Failed to fetch user:', fetchError);
            throw fetchError;
        }

        if (existingUser) {
            return existingUser;
        }

        // 2. User doesn't exist, start onboarding
        console.log('[ONBOARDING] Creating new user profile...');

        let hospital_id = supabaseUser.user_metadata?.hospital_id;
        const role = supabaseUser.user_metadata?.role || 'admin';

        // 3. Ensure Hospital exists
        if (!hospital_id) {
            console.log('[ONBOARDING] No hospital_id in metadata, creating default hospital...');
            const { data: hosp, error: hospErr } = await supabase
                .from('hospitals')
                .insert({ name: supabaseUser.user_metadata?.hospital_name || 'Default Hospital' })
                .select()
                .single();

            if (hospErr) {
                console.error('[ONBOARDING ERROR] Failed to create hospital:', hospErr);
                throw hospErr;
            }
            hospital_id = hosp.id;
        }

        // 4. Create User Record
        const { data: newUser, error: userErr } = await supabase
            .from('users')
            .insert({
                supabase_uid: supabaseUser.id,
                email: supabaseUser.email,
                role: role,
                hospital_id: hospital_id,
                full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0]
            })
            .select()
            .single();

        if (userErr) {
            console.error('[ONBOARDING ERROR] Failed to create user record:', userErr);
            throw userErr;
        }

        // 5. Role-specific profile setup
        if (role === 'doctor') {
            console.log('[ONBOARDING] Creating doctor profile for new user...');
            const { error: docErr } = await supabase
                .from('doctors')
                .insert({
                    user_id: newUser.id,
                    hospital_id: hospital_id,
                    specialization: 'General Practice'
                });

            if (docErr) {
                console.error('[ONBOARDING ERROR] Failed to create doctor record:', docErr);
                // Don't throw — user can still log in; doctor service handles recovery
            }
        }

        if (role === 'patient') {
            console.log('[ONBOARDING] Creating patient profile for new user...');
            const { error: patErr } = await supabase
                .from('patients')
                .insert({
                    user_id: newUser.id,
                    hospital_id: hospital_id,
                });

            if (patErr) {
                console.error('[ONBOARDING ERROR] Failed to create patient record:', patErr);
                // PatientService has a self-healing getPatientId fallback so this is not fatal
            }
        }

        return newUser;
    }
}
