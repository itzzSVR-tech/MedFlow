import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';
import { OperationsService } from './operations.service';

// ─── Triage calculation ───────────────────────────────────────────────────────
const URGENCY_MAP: Record<string, string> = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
    critical: 'CRITICAL',
};

function calculateTriage(urgency?: string): string {
    return URGENCY_MAP[(urgency || 'low').toLowerCase()] || 'LOW';
}

// ─── Patient ID helper ────────────────────────────────────────────────────────
const getPatientId = async (userId: string, hospitalId: string): Promise<string> => {
    const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .eq('hospital_id', hospitalId)
        .maybeSingle();

    if (error) throw new Error(`DB error looking up patient: ${error.message}`);
    if (data) return data.id;

    const { data: created, error: createErr } = await supabase
        .from('patients')
        .insert({ user_id: userId, hospital_id: hospitalId })
        .select()
        .single();

    if (createErr) throw new Error(`Failed to create patient profile: ${createErr.message}`);
    return created.id;
};

// ─── Service ──────────────────────────────────────────────────────────────────
export class PatientService {

    static async getMyAppointments(userId: string, hospitalId: string) {
        const patientId = await getPatientId(userId, hospitalId);

        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientId)
            .eq('hospital_id', hospitalId)
            .order('scheduled_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Book appointment with surge mode enforcement and auto doctor assignment.
     *
     * Surge mode rules:
     *   - If surge mode ON and triage < HIGH → reject with 503
     *   - Doctor can be auto-assigned by load balancer (doctor_id is optional)
     *   - CRITICAL → bed_required = true automatically
     */
    static async createAppointment(userId: string, hospitalId: string, body: {
        doctor_id?: string;
        specialization?: string;
        scheduled_at: string;
        symptoms?: string;
        urgency?: 'low' | 'medium' | 'high' | 'critical';
    }) {
        const { scheduled_at, symptoms, urgency, specialization } = body;
        let { doctor_id } = body;

        if (!scheduled_at) throw new Error('scheduled_at is required');

        const triage = calculateTriage(urgency);

        // ── Rule A & B: Booking mode enforcement ────────────────────────────
        const bookingMode = await OperationsService.getBookingMode(hospitalId);

        if (bookingMode === 'SURGE' && (triage === 'LOW' || triage === 'MEDIUM')) {
            throw Object.assign(
                new Error('Hospital in SURGE mode — only HIGH/CRITICAL accepted'),
                { statusCode: 503 }
            );
        }

        if (bookingMode === 'RESTRICTED' && triage === 'LOW') {
            throw Object.assign(
                new Error('Hospital in RESTRICTED mode — LOW priority bookings currently blocked'),
                { statusCode: 503 }
            );
        }

        // ── Doctor assignment ────────────────────────────────────────────────
        if (doctor_id) {
            // Validate manually chosen doctor capacity
            const load = await OperationsService.calculateDoctorLoad(hospitalId);
            const docLoad = load.find(d => d.doctor_id === doctor_id);
            if (!docLoad) throw new Error('Doctor not found in this hospital');
            if (docLoad.availability_status === 'off duty') throw new Error('Doctor is currently off duty');

            // Critical bypasses capacity check
            if (triage !== 'CRITICAL' && triage !== 'HIGH' && docLoad.active_appointments >= docLoad.max_active_cases) {
                throw new Error(`Dr. ${docLoad.doctor_name} is at maximum capacity.`);
            }
        } else {
            // Auto-assign: find the least-loaded available doctor (respects max_active_cases internally)
            doctor_id = await OperationsService.autoAssignDoctor(hospitalId, triage, specialization);
        }

        const patientId = await getPatientId(userId, hospitalId);

        const { data: appointment, error: insertErr } = await supabase
            .from('appointments')
            .insert({
                patient_id: patientId,
                doctor_id,
                hospital_id: hospitalId,
                scheduled_at,
                symptoms: symptoms || null,
                triage,
                status: 'scheduled',
                bed_required: triage === 'CRITICAL',
            })
            .select()
            .single();

        if (insertErr) throw insertErr;

        // ── Realtime broadcasts ──────────────────────────────────────────────
        const broadcasts: Promise<void>[] = [
            RealtimeService.broadcast(hospitalId, 'appointments', {
                type: 'APPOINTMENT_CREATED',
                data: appointment,
            }),
            RealtimeService.broadcast(hospitalId, 'dashboard', {
                type: 'METRICS_UPDATED',
                data: { trigger: 'appointment_created' },
            }),
        ];

        // CRITICAL → notify admin immediately for bed pre-allocation
        if (triage === 'CRITICAL') {
            broadcasts.push(
                RealtimeService.broadcast(hospitalId, 'beds', {
                    type: 'BED_ALLOCATION_REQUIRED',
                    data: {
                        appointmentId: appointment.id,
                        message: 'CRITICAL case booked — bed allocation required',
                        triage,
                    },
                })
            );
        }

        await Promise.all(broadcasts);

        await Promise.all(broadcasts);

        // ── Rule E: Recalculate metrics in real-time ──────────────────────────
        // This updates the hospital_metrics table for the admin dashboard
        await OperationsService.recalculateMetrics(hospitalId).catch(err =>
            console.error('[METRIC RECALCULATION ERROR]', err)
        );

        return appointment;
    }

    static async getMyPrescriptions(userId: string, hospitalId: string) {
        const patientId = await getPatientId(userId, hospitalId);

        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                appointments!inner (
                    patient_id,
                    scheduled_at,
                    symptoms
                )
            `)
            .eq('appointments.patient_id', patientId)
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getAvailableDoctors(hospitalId: string) {
        const { data, error } = await supabase
            .from('doctors')
            .select(`
                id,
                specialization,
                availability_status,
                users (
                    full_name,
                    email
                )
            `)
            .eq('hospital_id', hospitalId)
            .neq('availability_status', 'off duty');

        if (error) throw error;
        return data || [];
    }
}
