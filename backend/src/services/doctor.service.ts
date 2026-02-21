import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';

export class DoctorService {
    static async getMyAppointments(doctorId: string, hospitalId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .order('scheduled_at', { ascending: false });

        if (error) {
            console.error('Error in getMyAppointments:', error);
            throw error;
        }
        return data || [];
    }

    static async updateAppointmentStatus(doctorId: string, hospitalId: string, appointmentId: string, status: string) {
        const VALID_STATUSES = ['scheduled', 'completed', 'cancelled'];
        if (!VALID_STATUSES.includes(status)) {
            throw new Error(`Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async createPrescription(doctorId: string, hospitalId: string, body: {
        appointmentId: string;
        diagnosis?: string;
        medications?: string;
        notes?: string;
        follow_up_required?: boolean;
        draft_status?: 'draft' | 'final';
    }) {
        const { appointmentId, diagnosis, medications, notes, follow_up_required, draft_status } = body;

        if (!appointmentId) {
            throw new Error('appointmentId is required to create a prescription.');
        }

        // Verify the appointment belongs to this doctor and hospital
        const { data: appt, error: apptErr } = await supabase
            .from('appointments')
            .select('id, status')
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (apptErr) throw apptErr;
        if (!appt) {
            throw new Error('Appointment not found or does not belong to this doctor.');
        }

        const { data, error } = await supabase
            .from('prescriptions')
            .insert({
                appointment_id: appointmentId,
                doctor_id: doctorId,
                hospital_id: hospitalId,
                diagnosis: diagnosis || null,
                medications: medications || null,
                notes: notes || null,
                follow_up_required: follow_up_required ?? false,
                draft_status: draft_status || 'final',
            })
            .select()
            .single();

        if (error) throw error;

        // Broadcast realtime event
        await RealtimeService.broadcast(hospitalId, 'prescriptions', {
            type: 'PRESCRIPTION_CREATED',
            data: { prescriptionId: data.id, appointmentId, draft_status: data.draft_status }
        });

        return data;
    }

    static async updateAvailability(userId: string, hospitalId: string, status: string) {
        const VALID_STATUSES = ['available', 'busy', 'off duty'];
        if (!VALID_STATUSES.includes(status.toLowerCase())) {
            throw new Error(`Invalid availability status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('doctors')
            .update({ availability_status: status })
            .eq('user_id', userId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getWeeklyStats(doctorId: string, hospitalId: string) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('scheduled_at, status')
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .gte('scheduled_at', weekAgo.toISOString());

        if (error) throw error;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayName = days[date.getDay()];

            const dayAppointments = appointments?.filter(a => {
                const appDate = new Date(a.scheduled_at);
                return appDate.toDateString() === date.toDateString();
            }) || [];

            return {
                day: dayName,
                consultations: dayAppointments.length,
                completed: dayAppointments.filter(a => a.status === 'completed').length
            };
        });

        return weeklyData;
    }

    static async getProfile(userId: string, hospitalId: string) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                doctors (
                    *
                )
            `)
            .eq('id', userId)
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (error) {
            console.error('Error in getProfile:', error);
            throw error;
        }
        return data;
    }

    static async updateProfile(userId: string, hospitalId: string, body: {
        full_name?: string;
        specialization?: string;
    }) {
        const { full_name, specialization } = body;
        const updates: Promise<void>[] = [];

        if (full_name) {
            updates.push(
                supabase
                    .from('users')
                    .update({ full_name })
                    .eq('id', userId)
                    .eq('hospital_id', hospitalId)
                    .then(({ error }) => { if (error) throw error; }) as Promise<void>
            );
        }

        if (specialization) {
            updates.push(
                supabase
                    .from('doctors')
                    .update({ specialization })
                    .eq('user_id', userId)
                    .eq('hospital_id', hospitalId)
                    .then(({ error }) => { if (error) throw error; }) as Promise<void>
            );
        }

        await Promise.all(updates);
        return { success: true };
    }
}

