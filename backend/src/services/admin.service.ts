import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';

export class AdminService {

    /**
     * Creates a new doctor: Supabase Auth user → users table → doctors table
     * This is a 3-step atomic operation. If any step fails, no partial state is left.
     */
    static async createDoctor(hospitalId: string, doctorData: {
        full_name: string;
        email: string;
        specialization: string;
        temporary_password: string;
    }) {
        const { full_name, email, specialization, temporary_password } = doctorData;

        // 1. Create Supabase Auth user (Admin API bypasses email confirmation)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: temporary_password,
            email_confirm: true,
            user_metadata: {
                role: 'doctor',
                full_name,
                hospital_id: hospitalId,
            }
        });

        if (authError) {
            throw new Error(`Failed to create auth user: ${authError.message}`);
        }

        const supabase_uid = authData.user.id;

        // 2. Create entry in users table
        const { data: user, error: userError } = await supabase
            .from('users')
            .insert({
                supabase_uid,
                email,
                full_name,
                role: 'doctor',
                hospital_id: hospitalId,
                status: 'Active',
            })
            .select()
            .single();

        if (userError) {
            // Cleanup: delete the auth user if DB insert fails
            await supabase.auth.admin.deleteUser(supabase_uid);
            throw new Error(`Failed to create user record: ${userError.message}`);
        }

        // 3. Create entry in doctors table
        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .insert({
                user_id: user.id,
                hospital_id: hospitalId,
                specialization,
                availability_status: 'available',
            })
            .select()
            .single();

        if (doctorError) {
            // Cleanup: delete auth user and user record if doctors insert fails
            await supabase.auth.admin.deleteUser(supabase_uid);
            await supabase.from('users').delete().eq('id', user.id);
            throw new Error(`Failed to create doctor record: ${doctorError.message}`);
        }

        return { user, doctor };
    }

    static async getAllDoctors(hospitalId: string) {
        const { data, error } = await supabase
            .from('doctors')
            .select('*, users(*)')
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getAllUsers(hospitalId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getAllBeds(hospitalId: string) {
        const { data, error } = await supabase
            .from('beds')
            .select('*')
            .eq('hospital_id', hospitalId)
            .order('bed_number', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async updateBedStatus(hospitalId: string, bedId: string, status: string) {
        const VALID_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance'];
        if (!VALID_STATUSES.includes(status)) {
            throw new Error(`Invalid bed status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('beds')
            .update({ status })
            .eq('id', bedId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getAllAppointments(hospitalId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select('*, doctors(users(full_name, email))')
            .eq('hospital_id', hospitalId)
            .order('scheduled_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async updateAppointmentStatus(hospitalId: string, appointmentId: string, status: string) {
        const VALID_STATUSES = ['scheduled', 'completed', 'cancelled'];
        if (!VALID_STATUSES.includes(status)) {
            throw new Error(`Invalid appointment status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateDoctorStatus(hospitalId: string, doctorId: string, status: string) {
        const VALID_STATUSES = ['available', 'busy', 'off duty'];
        if (!VALID_STATUSES.includes(status.toLowerCase())) {
            throw new Error(`Invalid availability status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('doctors')
            .update({ availability_status: status })
            .eq('id', doctorId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getDashboardMetrics(hospitalId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const dayAgo = new Date();
        dayAgo.setHours(dayAgo.getHours() - 24);

        // Run all 4 independent queries in parallel
        const [
            { count: totalAppointments },
            { count: activeDoctors },
            { data: beds },
            { data: inflowData },
        ] = await Promise.all([
            supabase.from('appointments').select('*', { count: 'exact', head: true })
                .eq('hospital_id', hospitalId).gte('scheduled_at', startOfDay.toISOString()),
            supabase.from('doctors').select('*', { count: 'exact', head: true })
                .eq('hospital_id', hospitalId).eq('availability_status', 'available'),
            supabase.from('beds').select('*').eq('hospital_id', hospitalId),
            supabase.from('appointments').select('scheduled_at')
                .eq('hospital_id', hospitalId).gte('scheduled_at', dayAgo.toISOString()),
        ]);

        const totalBeds = beds?.length || 0;
        const occupiedBeds = beds?.filter((b: any) => b.status === 'Occupied').length || 0;
        const bedOccupancyPct = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

        const bedDistribution = {
            General: beds?.filter((b: any) => b.type === 'General' && b.status === 'Occupied').length || 0,
            ICU: beds?.filter((b: any) => b.type === 'ICU' && b.status === 'Occupied').length || 0,
            Isolation: beds?.filter((b: any) => b.type === 'Isolation' && b.status === 'Occupied').length || 0,
            TotalGeneral: beds?.filter((b: any) => b.type === 'General').length || 0,
            TotalICU: beds?.filter((b: any) => b.type === 'ICU').length || 0,
            TotalIsolation: beds?.filter((b: any) => b.type === 'Isolation').length || 0,
        };

        const hourlyInflow = Array.from({ length: 6 }, (_, i) => {
            const h = dayAgo.getHours() + (i * 4);
            const hourStr = `${String(h % 24).padStart(2, '0')}:00`;
            const windowStart = new Date(dayAgo);
            windowStart.setHours(h);
            const windowEnd = new Date(windowStart);
            windowEnd.setHours(windowEnd.getHours() + 4);
            const count = inflowData?.filter((a: any) => {
                const date = new Date(a.scheduled_at);
                return date >= windowStart && date < windowEnd;
            }).length || 0;
            return { hour: hourStr, val: count };
        });

        return {
            appointmentsToday: totalAppointments || 0,
            activeDoctors: activeDoctors || 0,
            bedOccupancy: Math.round(bedOccupancyPct),
            totalBeds,
            occupiedBeds,
            bedDistribution,
            hourlyInflow
        };
    }

    static async updateUserStatus(hospitalId: string, userId: string, status: string) {
        const VALID_STATUSES = ['Active', 'Suspended'];
        if (!VALID_STATUSES.includes(status)) {
            throw new Error(`Invalid user status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', userId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getAnalytics(hospitalId: string) {
        const { data: beds } = await supabase
            .from('beds')
            .select('status, type')
            .eq('hospital_id', hospitalId);

        const totalBeds = beds?.length || 0;
        const occupiedBeds = beds?.filter(b => b.status === 'Occupied').length || 0;
        const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) : 0;

        const fortAgo = new Date();
        fortAgo.setDate(fortAgo.getDate() - 14);

        const { data: trendData } = await supabase
            .from('appointments')
            .select('scheduled_at, status')
            .eq('hospital_id', hospitalId)
            .gte('scheduled_at', fortAgo.toISOString());

        const dailyTrend = Array.from({ length: 14 }, (_, i) => {
            const date = new Date(fortAgo);
            date.setDate(date.getDate() + i + 1);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayAppts = trendData?.filter(a => new Date(a.scheduled_at).toDateString() === date.toDateString()) || [];
            return {
                date: dateStr,
                opd: dayAppts.length,
                completed: dayAppts.filter(a => a.status === 'completed').length,
            };
        });

        return {
            surgeRisk: Math.round(occupancyRate * 100),
            occupancyRate,
            dailyTrend
        };
    }

    /**
     * Reports: aggregate data per hospital for the Reports page.
     */
    static async getReports(hospitalId: string) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Run all independent queries in parallel
        const [
            { data: apptData },
            { data: beds },
            { data: doctors },
            { count: totalAppointments },
            { count: completedAppointments },
        ] = await Promise.all([
            supabase.from('appointments').select('scheduled_at, status')
                .eq('hospital_id', hospitalId).gte('scheduled_at', sevenDaysAgo.toISOString()),
            supabase.from('beds').select('type, status').eq('hospital_id', hospitalId),
            // Fetch doctors + their 7-day appt count via a join rather than N+1 queries
            supabase.from('doctors').select('id, specialization, users(full_name), appointments(id, scheduled_at)')
                .eq('hospital_id', hospitalId),
            supabase.from('appointments').select('*', { count: 'exact', head: true })
                .eq('hospital_id', hospitalId),
            supabase.from('appointments').select('*', { count: 'exact', head: true })
                .eq('hospital_id', hospitalId).eq('status', 'completed'),
        ]);

        // 1. Appointments per day
        const appointmentsPerDay = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const total = apptData?.filter((a: any) => new Date(a.scheduled_at).toDateString() === date.toDateString()).length || 0;
            const completed = apptData?.filter((a: any) =>
                new Date(a.scheduled_at).toDateString() === date.toDateString() && a.status === 'completed'
            ).length || 0;
            return { date: label, total, completed };
        });

        // 2. Bed utilization
        const bedUtilization = ['ICU', 'General', 'Isolation'].map(type => {
            const total = beds?.filter((b: any) => b.type === type).length || 0;
            const occupied = beds?.filter((b: any) => b.type === type && b.status === 'Occupied').length || 0;
            return { type, total, occupied, utilizationPct: total > 0 ? Math.round((occupied / total) * 100) : 0 };
        });

        // 3. Doctor load — computed from the joined appointments array (no N+1)
        const doctorLoad = (doctors || []).map((doc: any) => {
            const weekAppts = (doc.appointments || []).filter((a: any) =>
                new Date(a.scheduled_at) >= sevenDaysAgo
            ).length;
            return {
                doctorName: (doc.users as any)?.full_name || 'Unknown',
                specialization: doc.specialization,
                appointmentsThisWeek: weekAppts,
            };
        });

        return {
            appointmentsPerDay,
            bedUtilization,
            doctorLoad,
            totals: {
                allTime: totalAppointments || 0,
                completed: completedAppointments || 0,
                totalBeds: beds?.length || 0,
                occupiedBeds: beds?.filter((b: any) => b.status === 'Occupied').length || 0,
            }
        };
    }

    /**
     * Hospital Settings: Get per-tenant configuration
     */
    static async getSettings(hospitalId: string) {
        const { data, error } = await supabase
            .from('hospital_settings')
            .select('*')
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (error) throw error;

        // Return defaults if no settings row exists yet
        if (!data) {
            return {
                hospital_id: hospitalId,
                hospital_name: null,
                timezone: 'Asia/Kolkata',
                notifications_enabled: true,
                surge_alert_threshold: 80,
            };
        }

        return data;
    }

    /**
     * Hospital Settings: Upsert per-tenant configuration
     */
    static async updateSettings(hospitalId: string, settings: {
        hospital_name?: string;
        timezone?: string;
        notifications_enabled?: boolean;
        surge_alert_threshold?: number;
    }) {
        const { data, error } = await supabase
            .from('hospital_settings')
            .upsert({
                hospital_id: hospitalId,
                ...settings,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'hospital_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
