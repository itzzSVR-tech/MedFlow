import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';

// =====================================================================
// MEASURABLE THRESHOLDS — The single source of truth for all rules.
// =====================================================================
export const RULES = {
    // Rule A: Doctor Capacity
    DOCTOR_MAX_CAPACITY: 5,            // active appts per doctor per hour → overloaded

    // Rule B: Overcrowding & Mode Switching
    // If waiting > doctors * 5, mode becomes RESTRICTED
    OVERLOAD_WAITING_PER_DOCTOR: 5,
    // Arrival Rate > 1.2 * Completion Rate → mode becomes RESTRICTED
    OVERLOAD_FLOW_RATIO: 1.2,

    // Rule C: Critical Priority
    CRITICAL_WAIT_ALERT_MINUTES: 10,   // CRITICAL patient waits longer → admin alert

    // Rule D: Bed Control
    ICU_CRITICAL_OCCUPANCY_PCT: 90,    // above this → block HIGH admissions, only CRITICAL allowed
    SURGE_ICU_MIN_AVAILABLE: 2,        // fewer than 2 ICU beds free → trigger SURGE booking mode

    // Booking Mode restrictions
    SURGE_ALLOWED_TRIAGE: ['HIGH', 'CRITICAL'] as string[],
};

// Triage sort weight (higher = served first)
const TRIAGE_WEIGHT: Record<string, number> = {
    CRITICAL: 1000, HIGH: 100, MEDIUM: 10, LOW: 1,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoctorLoadEntry {
    doctor_id: string;
    doctor_name: string;
    specialization: string;
    availability_status: string;
    active_appointments: number;
    max_active_cases: number;
    load_pct: number;         // active / max_active_cases * 100
    is_overloaded: boolean;   // active >= max_active_cases
}

export interface OperationalAlert {
    type:
    | 'DOCTOR_OVERLOAD'
    | 'CRITICAL_WAIT'
    | 'SURGE_AUTO_TRIGGERED'
    | 'SURGE_AUTO_CLEARED'
    | 'BED_SHORTAGE'
    | 'NO_AVAILABLE_DOCTORS'
    | 'HOSPITAL_OVERLOADED';
    severity: 'warning' | 'critical';
    message: string;
    meta?: Record<string, unknown>;
}

export interface OperationalSnapshot {
    hospitalId: string;
    surgeMode: boolean;
    // Load metrics (the numbers that must change behavior)
    hospitalLoadPct: number;         // total_active / (doctors * DOCTOR_MAX_CAPACITY) * 100
    totalDoctors: number;
    totalCapacity: number;           // total_doctors * DOCTOR_MAX_CAPACITY
    totalAppointmentsToday: number;
    activeAppointments: number;
    criticalCases: number;
    waitingForBed: number;
    completedToday: number;
    cancelledToday: number;
    avgCriticalWaitMinutes: number | null;
    // Bed metrics
    totalBeds: number;
    totalIcuBeds: number;
    occupiedIcuBeds: number;
    availableIcuBeds: number;
    icuOccupancyPct: number;
    bedOccupancyPct: number;
    // Doctor metrics
    doctorLoad: DoctorLoadEntry[];
    avgDoctorLoad: number;
    // Auto-detected alerts
    alerts: OperationalAlert[];
}

// =====================================================================
// Operations Service — Deterministic rule engine
// =====================================================================

export class OperationsService {

    // ── Rule A: Doctor Load Calculation ──────────────────────────────────────

    static async calculateDoctorLoad(hospitalId: string): Promise<DoctorLoadEntry[]> {
        const startOfHour = new Date();
        startOfHour.setMinutes(0, 0, 0);

        const [doctorsRes, appointmentsRes] = await Promise.all([
            supabase
                .from('doctors')
                .select('id, specialization, availability_status, max_active_cases, users(full_name)')
                .eq('hospital_id', hospitalId),
            supabase
                .from('appointments')
                .select('doctor_id, status')
                .eq('hospital_id', hospitalId)
                .in('status', ['scheduled', 'in_progress'])
                .gte('scheduled_at', startOfHour.toISOString()),
        ]);

        const doctors = doctorsRes.data || [];
        const appts = appointmentsRes.data || [];

        return doctors.map((doc: any) => {
            const active = appts.filter(a => a.doctor_id === doc.id).length;
            const maxCap = doc.max_active_cases || RULES.DOCTOR_MAX_CAPACITY;
            // Ensure join data is safely accessed
            const name = (doc.users as any)?.full_name || 'System Doctor';

            return {
                doctor_id: doc.id,
                doctor_name: name,
                specialization: doc.specialization,
                availability_status: doc.availability_status,
                active_appointments: active,
                max_active_cases: maxCap,
                load_pct: maxCap > 0 ? Math.round((active / maxCap) * 100) : 0,
                is_overloaded: active >= maxCap,
            };
        });
    }

    // ── Rule A: Auto Doctor Assignment by Load ────────────────────────────────
    // Strict adherence to capacity. If all doctors full → reject.

    static async autoAssignDoctor(
        hospitalId: string,
        triage: string,
        preferredSpecialization?: string,
    ): Promise<string> {
        const load = await this.calculateDoctorLoad(hospitalId);

        // Filter: not off duty AND has capacity (unless CRITICAL/HIGH bypass)
        let eligible = load.filter(d => d.availability_status !== 'off duty');

        // Critical and High triage can overflow only if absolute necessity
        if (triage !== 'CRITICAL' && triage !== 'HIGH') {
            eligible = eligible.filter(d => d.active_appointments < d.max_active_cases);
        }

        if (eligible.length === 0) {
            // Check if any doctor exists at all
            if (load.filter(d => d.availability_status !== 'off duty').length === 0) {
                throw new Error('All doctors are currently off duty');
            }
            throw new Error('All available doctors are currently at maximum capacity');
        }

        // Prefer specialization match
        const matched = preferredSpecialization
            ? eligible.filter(d => d.specialization.toLowerCase() === preferredSpecialization.toLowerCase())
            : [];
        const pool = matched.length > 0 ? matched : eligible;

        // Assign to least loaded
        return pool.sort((a, b) => a.active_appointments - b.active_appointments)[0].doctor_id;
    }

    // ── Live Metric persistence (hospital_metrics table) ──────────────────────

    static async getBookingMode(hospitalId: string): Promise<string> {
        const { data } = await supabase
            .from('hospital_settings')
            .select('booking_mode')
            .eq('hospital_id', hospitalId)
            .maybeSingle();
        return data?.booking_mode ?? 'NORMAL';
    }

    static async setBookingMode(hospitalId: string, mode: 'NORMAL' | 'RESTRICTED' | 'SURGE'): Promise<void> {
        await supabase
            .from('hospital_settings')
            .update({ booking_mode: mode, updated_at: new Date().toISOString() })
            .eq('hospital_id', hospitalId);

        await RealtimeService.broadcast(hospitalId, 'dashboard', {
            type: 'BOOKING_MODE_CHANGED',
            data: { mode },
        });
    }

    /**
     * The Heartbeat of the Engine.
     * Recalculates all flow rates, occupancy, and load.
     * Updates hospital_metrics table for persistence.
     * Decides on automatic mode switching.
     */
    static async recalculateMetrics(hospitalId: string): Promise<void> {
        const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            { data: arrivalRes },
            { data: completionRes },
            { data: appts },
            { data: beds },
            { data: doctors },
            currentMode
        ] = await Promise.all([
            supabase.from('appointments').select('id').eq('hospital_id', hospitalId).gte('created_at', thirtyMinAgo),
            supabase.from('appointments').select('id').eq('hospital_id', hospitalId).gte('completed_at', thirtyMinAgo),
            supabase.from('appointments').select('status, triage, created_at').eq('hospital_id', hospitalId).neq('status', 'cancelled'),
            supabase.from('beds').select('type, status').eq('hospital_id', hospitalId),
            supabase.from('doctors').select('id, availability_status, max_active_cases').eq('hospital_id', hospitalId).neq('availability_status', 'off duty'),
            this.getBookingMode(hospitalId)
        ]);

        // 1. Flow Rates (per 30 min)
        const arrivalRate = (arrivalRes || []).length;
        const completionRate = (completionRes || []).length;

        // 2. Load Metrics
        const activeAppts = (appts || []).filter(a => ['scheduled', 'in_progress', 'waiting_for_bed'].includes(a.status));
        const waitingPatients = (appts || []).filter(a => a.status === 'scheduled' || a.status === 'waiting_for_bed');
        const doctorsArr = (doctors || []) as any[];
        const totalDoctors = doctorsArr.length;
        const totalCapacity = doctorsArr.reduce((sum, d) => sum + (d.max_active_cases || 5), 0);
        const hospitalLoadPct = totalCapacity > 0 ? Math.round((activeAppts.length / totalCapacity) * 100) : 0;

        // 3. Bed Occupancy
        const icuBeds = (beds || []).filter(b => (b as any).type === 'ICU');
        const genBeds = (beds || []).filter(b => (b as any).type === 'General');
        const occupiedIcu = icuBeds.filter(b => (b as any).status === 'Occupied').length;
        const occupiedGen = genBeds.filter(b => (b as any).status === 'Occupied').length;
        const availableIcu = icuBeds.length - occupiedIcu;
        const icuOccPct = icuBeds.length > 0 ? Math.round((occupiedIcu / icuBeds.length) * 100) : 0;
        const genOccPct = genBeds.length > 0 ? Math.round((occupiedGen / genBeds.length) * 100) : 0;

        // 4. Critical & Wait
        const criticalWaiting = waitingPatients.filter(a => (a as any).triage === 'CRITICAL');
        const now = Date.now();
        const avgWait = waitingPatients.length > 0
            ? Math.round(waitingPatients.reduce((sum: number, a: any) => sum + (now - new Date(a.created_at).getTime()), 0) / waitingPatients.length / 60000)
            : 0;

        // 5. Mode Enforcement Logic
        let targetMode = currentMode;

        // Rule: If waiting > doctors * 5 OR arrival > completion * 1.2 → RESTRICTED
        const flowOverload = completionRate > 0 && arrivalRate > completionRate * RULES.OVERLOAD_FLOW_RATIO;
        const queueOverload = waitingPatients.length > (totalDoctors * RULES.OVERLOAD_WAITING_PER_DOCTOR);

        if (availableIcu < RULES.SURGE_ICU_MIN_AVAILABLE || totalDoctors === 0) {
            targetMode = 'SURGE';
        } else if (flowOverload || queueOverload || hospitalLoadPct >= 100) {
            targetMode = 'RESTRICTED';
        } else {
            targetMode = 'NORMAL';
        }

        if (targetMode !== currentMode) {
            await this.setBookingMode(hospitalId, targetMode as any);
        }

        // 6. Persist to hospital_metrics
        await supabase.from('hospital_metrics').upsert({
            hospital_id: hospitalId,
            active_appointments: activeAppts.length,
            waiting_patients: waitingPatients.length,
            arrival_rate_30m: arrivalRate,
            completion_rate_30m: completionRate,
            hospital_load_pct: hospitalLoadPct,
            icu_occupancy_pct: icuOccPct,
            general_occupancy_pct: genOccPct,
            avg_wait_time_mins: avgWait,
            critical_waiting_count: criticalWaiting.length,
            updated_at: new Date().toISOString()
        }, { onConflict: 'hospital_id' });

        // 7. Broadcast the heartbeat
        await RealtimeService.broadcast(hospitalId, 'dashboard', {
            type: 'METRICS_UPDATED',
            data: { trigger: 'recalculation', hospital_id: hospitalId }
        });
    }

    // ── Backward Compatibility Helpers ────────────────────────────────────────

    static async getSurgeMode(hospitalId: string): Promise<boolean> {
        const mode = await this.getBookingMode(hospitalId);
        return mode === 'SURGE';
    }

    static async setSurgeMode(hospitalId: string, enabled: boolean): Promise<void> {
        return this.setBookingMode(hospitalId, enabled ? 'SURGE' : 'NORMAL');
    }

    // ── Old Trigger methods (redirect to recalculateMetrics) ─────────────────

    static async checkAndAutoSurge(hospitalId: string): Promise<void> {
        return this.recalculateMetrics(hospitalId);
    }

    // ── Rule B: Critical Wait Alerting ────────────────────────────────────────
    // Checks for any CRITICAL appointment waiting > CRITICAL_WAIT_ALERT_MINUTES.
    // Should be called on a timer OR after every appointment status change.

    static async checkCriticalWaitAlerts(hospitalId: string): Promise<OperationalAlert[]> {
        const { data: criticalAppts } = await supabase
            .from('appointments')
            .select('id, created_at, scheduled_at, status')
            .eq('hospital_id', hospitalId)
            .eq('triage', 'CRITICAL')
            .eq('status', 'scheduled');  // still waiting, not yet in_progress

        const alerts: OperationalAlert[] = [];
        const now = Date.now();
        const threshold = RULES.CRITICAL_WAIT_ALERT_MINUTES * 60 * 1000;

        for (const appt of (criticalAppts || [])) {
            const waitMs = now - new Date(appt.created_at).getTime();
            if (waitMs > threshold) {
                const waitMin = Math.round(waitMs / 60000);
                alerts.push({
                    type: 'CRITICAL_WAIT',
                    severity: 'critical',
                    message: `CRITICAL patient waiting ${waitMin}min (limit: ${RULES.CRITICAL_WAIT_ALERT_MINUTES}min)`,
                    meta: { appointmentId: appt.id, waitMinutes: waitMin },
                });

                // Real-time push to admin
                await RealtimeService.broadcast(hospitalId, 'dashboard', {
                    type: 'CRITICAL_WAIT_ALERT',
                    data: { appointmentId: appt.id, waitMinutes: waitMin },
                });
            }
        }

        return alerts;
    }

    // ── Rule D: Bed Lock Check ────────────────────────────────────────────────
    // When doctor marks outcome = 'admitted', call this.
    // Returns the best available bed to allocate, or null if none.
    // If none → appointment → 'waiting_for_bed' + admin alert.

    static async findAvailableIcuBed(hospitalId: string): Promise<string | null> {
        const { data } = await supabase
            .from('beds')
            .select('id')
            .eq('hospital_id', hospitalId)
            .eq('type', 'ICU')
            .eq('status', 'Available')
            .limit(1);
        return data?.[0]?.id ?? null;
    }

    // ── Full Operational Snapshot ─────────────────────────────────────────────
    // Single endpoint that gives admin everything needed to make decisions.
    // Every metric is used by a rule — no vanity numbers.

    static async getOperationalSnapshot(hospitalId: string): Promise<OperationalSnapshot> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [doctorLoad, surgeMode, { data: todayAppts }, { data: beds }] = await Promise.all([
            this.calculateDoctorLoad(hospitalId),
            this.getSurgeMode(hospitalId),
            supabase
                .from('appointments')
                .select('id, status, triage, created_at, started_at')
                .eq('hospital_id', hospitalId)
                .gte('scheduled_at', startOfDay.toISOString()),
            supabase
                .from('beds')
                .select('type, status')
                .eq('hospital_id', hospitalId),
        ]);

        const appts = todayAppts || [];
        const bedsArr = beds || [];
        const totalDoctors = doctorLoad.length;
        const totalCapacity = totalDoctors * RULES.DOCTOR_MAX_CAPACITY;
        const activeCount = appts.filter(a => ['scheduled', 'in_progress'].includes(a.status)).length;
        const criticalCount = appts.filter(a => a.triage === 'CRITICAL' && a.status !== 'completed').length;

        // Hospital load %
        const hospitalLoadPct = totalCapacity > 0
            ? Math.round((activeCount / totalCapacity) * 100)
            : 0;

        // Bed metrics
        const totalBeds = bedsArr.length;
        const icuBeds = bedsArr.filter((b: any) => b.type === 'ICU');
        const occupiedAll = bedsArr.filter((b: any) => b.status === 'Occupied').length;
        const occupiedIcu = icuBeds.filter((b: any) => b.status === 'Occupied').length;
        const availableIcu = icuBeds.length - occupiedIcu;
        const icuOccPct = icuBeds.length > 0 ? Math.round((occupiedIcu / icuBeds.length) * 100) : 0;
        const bedOccPct = totalBeds > 0 ? Math.round((occupiedAll / totalBeds) * 100) : 0;

        // Avg critical wait time (minutes) — only for those still waiting
        const criticalWaiting = appts.filter(a => a.triage === 'CRITICAL' && a.status === 'scheduled');
        const now = Date.now();
        const avgCriticalWait = criticalWaiting.length > 0
            ? Math.round(
                criticalWaiting.reduce((sum, a) => sum + (now - new Date(a.created_at).getTime()), 0)
                / criticalWaiting.length / 60000
            )
            : null;

        const avgLoad = doctorLoad.length > 0
            ? Math.round(
                (doctorLoad.reduce((s, d) => s + d.active_appointments, 0) / doctorLoad.length) * 10
            ) / 10
            : 0;

        // ── Auto-generate alerts based on the same rules used for enforcement ──
        const alerts: OperationalAlert[] = [];

        // Rule A: Doctor overload alerts
        doctorLoad.filter(d => d.is_overloaded).forEach(d => {
            alerts.push({
                type: 'DOCTOR_OVERLOAD',
                severity: 'warning',
                message: `Dr. ${d.doctor_name}: ${d.active_appointments}/${RULES.DOCTOR_MAX_CAPACITY} capacity`,
                meta: { doctorId: d.doctor_id },
            });
        });

        // Rule B: Critical wait alerts
        const critWaitAlerts = await this.checkCriticalWaitAlerts(hospitalId);
        alerts.push(...critWaitAlerts);

        // Rule C: Hospital overload
        if (hospitalLoadPct >= 100) {
            alerts.push({
                type: 'HOSPITAL_OVERLOADED',
                severity: 'critical',
                message: `Hospital at ${hospitalLoadPct}% capacity (${activeCount}/${totalCapacity} active appointments)`,
            });
        }

        // Rule D: ICU shortage
        if (icuOccPct >= RULES.ICU_CRITICAL_OCCUPANCY_PCT) {
            alerts.push({
                type: 'BED_SHORTAGE',
                severity: 'critical',
                message: `ICU at ${icuOccPct}% occupancy — ${availableIcu} beds remaining`,
            });
        }

        if (availableIcu < RULES.SURGE_ICU_MIN_AVAILABLE) {
            alerts.push({
                type: 'BED_SHORTAGE',
                severity: 'critical',
                message: `Only ${availableIcu} ICU bed(s) available — surge threshold met`,
            });
        }

        if (doctorLoad.length > 0 && doctorLoad.every(d => d.availability_status === 'off duty')) {
            alerts.push({
                type: 'NO_AVAILABLE_DOCTORS',
                severity: 'critical',
                message: 'All doctors are off duty — no capacity for new appointments',
            });
        }

        return {
            hospitalId,
            surgeMode,
            hospitalLoadPct,
            totalDoctors,
            totalCapacity,
            totalAppointmentsToday: appts.length,
            activeAppointments: activeCount,
            criticalCases: criticalCount,
            waitingForBed: appts.filter(a => a.status === 'waiting_for_bed').length,
            completedToday: appts.filter(a => a.status === 'completed').length,
            cancelledToday: appts.filter(a => a.status === 'cancelled').length,
            avgCriticalWaitMinutes: avgCriticalWait,
            totalBeds,
            totalIcuBeds: icuBeds.length,
            occupiedIcuBeds: occupiedIcu,
            availableIcuBeds: availableIcu,
            icuOccupancyPct: icuOccPct,
            bedOccupancyPct: bedOccPct,
            doctorLoad,
            avgDoctorLoad: avgLoad,
            alerts,
        };
    }

    // ── Status Transition Validation ──────────────────────────────────────────
    // Strict state machine. No backward jumps. No skipped states.

    static validateStatusTransition(currentStatus: string, newStatus: string): void {
        const TRANSITIONS: Record<string, string[]> = {
            scheduled: ['in_progress', 'cancelled'],
            in_progress: ['completed'],
            completed: [],
            cancelled: [],
            waiting_for_bed: ['admitted', 'cancelled'],
            admitted: [],
        };
        const allowed = TRANSITIONS[currentStatus] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new Error(
                `Invalid transition: "${currentStatus}" → "${newStatus}". ` +
                `Allowed: [${allowed.join(', ') || 'none'}]`
            );
        }
    }

    // ── Priority Sort ─────────────────────────────────────────────────────────
    // Triage (DESC) → Wait Time (DESC) → Scheduled Time (ASC)

    static sortByPriority<T extends { triage: string; scheduled_at: string; created_at: string }>(rows: T[]): T[] {
        return [...rows].sort((a, b) => {
            // 1. Triage priority
            const tDiff = (TRIAGE_WEIGHT[b.triage] ?? 0) - (TRIAGE_WEIGHT[a.triage] ?? 0);
            if (tDiff !== 0) return tDiff;

            // 2. Wait time priority (Longer wait = higher priority)
            const waitA = Date.now() - new Date(a.created_at).getTime();
            const waitB = Date.now() - new Date(b.created_at).getTime();
            if (Math.abs(waitA - waitB) > 60000) { // If diff > 1 min
                return waitB - waitA;
            }

            // 3. FIFO
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
        });
    }

    // ── Bed Allocation ────────────────────────────────────────────────────────

    static async allocateBed(
        hospitalId: string,
        bedId: string,
        appointmentId: string,
    ): Promise<void> {
        // ── Rule D: Action-Driven Bed Lock ──────────────────────────────────
        // Using the v7 Postgres RPC function for atomic allocation.
        // This prevents double-booking via FOR UPDATE SKIP LOCKED.
        const { data, error } = await supabase.rpc('allocate_bed_transaction', {
            p_hospital_id: hospitalId,
            p_appt_id: appointmentId,
            p_bed_type: (await (async () => {
                const { data: b } = await supabase.from('beds').select('type').eq('id', bedId).single();
                return b?.type || 'General';
            })())
        });

        if (error) {
            console.error('[RPC_BED_ALLOCATION_ERROR]', error);
            throw new Error(`Bed allocation failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('No available bed found or transaction failed');
        }

        await Promise.all([
            RealtimeService.broadcast(hospitalId, 'beds', {
                type: 'BED_ALLOCATED',
                data: { bedId, appointmentId },
            }),
            this.checkAndAutoSurge(hospitalId),  // ICU change may clear surge
        ]);
    }

    // ── Appointment Reassignment ──────────────────────────────────────────────

    static async reassignAppointment(
        hospitalId: string,
        appointmentId: string,
        newDoctorId: string,
    ): Promise<void> {
        const { data: doc, error: docErr } = await supabase
            .from('doctors')
            .select('id, availability_status')
            .eq('id', newDoctorId)
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (docErr) throw docErr;
        if (!doc) throw new Error('Target doctor not found in this hospital');
        if (doc.availability_status === 'off duty') {
            throw new Error('Cannot reassign to a doctor who is off duty');
        }

        const { data: appt, error } = await supabase
            .from('appointments')
            .update({ doctor_id: newDoctorId })
            .eq('id', appointmentId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();

        if (error) throw error;

        await Promise.all([
            RealtimeService.broadcast(hospitalId, 'appointments', {
                type: 'APPOINTMENT_REASSIGNED',
                data: { appointmentId, newDoctorId, appointment: appt },
            }),
            this.checkAndAutoSurge(hospitalId),  // load changed
        ]);
    }
}
