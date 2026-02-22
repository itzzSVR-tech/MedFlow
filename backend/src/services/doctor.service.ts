import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';
import { OperationsService } from './operations.service';

export class DoctorService {

    /**
     * Get appointments for this doctor, sorted by operational priority:
     * CRITICAL → HIGH → MEDIUM → LOW, then by scheduled_at ASC within same triage.
     */
    static async getMyAppointments(doctorId: string, hospitalId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .order('scheduled_at', { ascending: true });   // secondary sort handled in JS

        if (error) {
            console.error('Error in getMyAppointments:', error);
            throw error;
        }

        // Primary sort: triage priority (CRITICAL first); secondary: scheduled_at
        return OperationsService.sortByPriority(data || []);
    }

    /**
     * Transition appointment status with strict validation.
     * Allowed: scheduled→in_progress, scheduled→cancelled, in_progress→completed
     * Sets started_at when moving to in_progress, completed_at when completed.
     */
    static async updateAppointmentStatus(
        doctorId: string,
        hospitalId: string,
        appointmentId: string,
        newStatus: string,
    ) {
        // Fetch current status
        const { data: current, error: fetchErr } = await supabase
            .from('appointments')
            .select('id, status, triage, hospital_id')
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (fetchErr) throw fetchErr;
        if (!current) throw new Error('Appointment not found or does not belong to this doctor');

        // Enforce strict transition rules
        OperationsService.validateStatusTransition(current.status, newStatus);

        // ── Rule A: Doctor Capacity Block ──────────────────────────────────
        // Only block if moving TO 'in_progress' and already at max_active_cases
        if (newStatus === 'in_progress') {
            const load = await OperationsService.calculateDoctorLoad(hospitalId);
            const myLoad = load.find(d => d.doctor_id === doctorId);
            if (myLoad && myLoad.active_appointments >= myLoad.max_active_cases) {
                throw Object.assign(
                    new Error(`At maximum capacity (${myLoad.max_active_cases}). Complete active cases first.`),
                    { statusCode: 429 }
                );
            }
        }

        // Build the update payload
        const update: Record<string, any> = { status: newStatus };
        if (newStatus === 'in_progress') update.started_at = new Date().toISOString();
        if (newStatus === 'completed') update.completed_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('appointments')
            .update(update)
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;

        // Realtime: update doctor queue + admin dashboard + recalculate load → may auto-clear/trigger surge
        await Promise.all([
            RealtimeService.notifyAppointmentUpdate(hospitalId, data),
            RealtimeService.broadcast(hospitalId, 'dashboard', {
                type: 'METRICS_UPDATED',
                data: { trigger: 'appointment_status_changed', status: newStatus },
            }),
            OperationsService.recalculateMetrics(hospitalId),
        ]);

        return data;
    }

    /**
     * Rule D — Bed Lock Rule:
     * Set appointment outcome after completion.
     * 'discharged' | 'follow_up' → normal close.
     * 'admitted' → check ICU bed availability:
     *   - Bed available → auto-allocate, status = 'admitted'
     *   - No bed → status = 'waiting_for_bed', admin critical alert fired
     */
    static async setOutcome(
        doctorId: string,
        hospitalId: string,
        appointmentId: string,
        outcome: 'discharged' | 'follow_up' | 'admitted',
    ) {
        const VALID_OUTCOMES = ['discharged', 'follow_up', 'admitted'];
        if (!VALID_OUTCOMES.includes(outcome)) {
            throw new Error(`Invalid outcome. Must be one of: ${VALID_OUTCOMES.join(', ')}`);
        }

        // Verify appointment exists and belongs to doctor
        const { data: appt, error: fetchErr } = await supabase
            .from('appointments')
            .select('id, triage, status')
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!appt) throw new Error('Appointment not found or not yours');

        if (outcome === 'admitted') {
            // ── Rule D: Bed Lock ──────────────────────────────────────────
            const availableBedId = await OperationsService.findAvailableIcuBed(hospitalId);

            if (availableBedId) {
                // Auto-allocate: marks bed Occupied and appointment admitted
                // This now uses the v7 allocate_bed_transaction RPC internally
                await OperationsService.allocateBed(hospitalId, availableBedId, appointmentId);

                return { appointmentId, status: 'admitted', bedId: availableBedId };
            } else {
                // No ICU bed free → waiting_for_bed
                const { data, error } = await supabase
                    .from('appointments')
                    .update({
                        outcome: 'admitted',
                        bed_required: true,
                        status: 'waiting_for_bed',
                        waiting_since: new Date().toISOString(),
                    })
                    .eq('id', appointmentId)
                    .eq('hospital_id', hospitalId)
                    .select()
                    .single();
                if (error) throw error;

                // Critical alert — admin must act
                await RealtimeService.broadcast(hospitalId, 'beds', {
                    type: 'BED_ALLOCATION_REQUIRED',
                    data: {
                        appointmentId,
                        triage: appt.triage,
                        severity: 'critical',
                        message: 'NO ICU BEDS AVAILABLE — Patient queued as waiting_for_bed',
                    },
                });

                console.warn(`[BED SHORTAGE] appointment=${appointmentId} triage=${appt.triage} → waiting_for_bed`);
                return data;
            }
        }

        // For discharged / follow_up: simple update
        const { data, error } = await supabase
            .from('appointments')
            .update({ outcome })
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;

        // Sync Metrics
        await OperationsService.recalculateMetrics(hospitalId).catch(err =>
            console.error('[SET_OUTCOME_METRIC_ERROR]', err)
        );

        return data;
    }

    /**
     * Create prescription for an appointment.
     * Strictly enforces: appointment must belong to this doctor in this hospital.
     */
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

        await RealtimeService.broadcast(hospitalId, 'prescriptions', {
            type: 'PRESCRIPTION_CREATED',
            data: { prescriptionId: data.id, appointmentId, draft_status: data.draft_status }
        });

        return data;
    }

    /**
     * Update doctor availability status.
     */
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

        await RealtimeService.notifyDoctorAvailability(hospitalId, data.id, status);

        // Sync Metrics
        await OperationsService.recalculateMetrics(hospitalId).catch(err =>
            console.error('[AVAILABILITY_METRIC_ERROR]', err)
        );

        return data;
    }

    /**
     * Weekly stats for doctor dashboard chart.
     */
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
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayAppts = appointments?.filter(a =>
                new Date(a.scheduled_at).toDateString() === date.toDateString()
            ) || [];
            return {
                day: days[date.getDay()],
                consultations: dayAppts.length,
                completed: dayAppts.filter(a => a.status === 'completed').length,
            };
        });
    }

    static async getProfile(userId: string, hospitalId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*, doctors(*)')
            .eq('id', userId)
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (error) throw error;
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
                supabase.from('users').update({ full_name })
                    .eq('id', userId).eq('hospital_id', hospitalId)
                    .then(({ error }) => { if (error) throw error; }) as Promise<void>
            );
        }
        if (specialization) {
            updates.push(
                supabase.from('doctors').update({ specialization })
                    .eq('user_id', userId).eq('hospital_id', hospitalId)
                    .then(({ error }) => { if (error) throw error; }) as Promise<void>
            );
        }

        await Promise.all(updates);
        return { success: true };
    }
}
