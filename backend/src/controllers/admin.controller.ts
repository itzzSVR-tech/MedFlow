import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AdminService } from '../services/admin.service';
import { OperationsService } from '../services/operations.service';
import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';

// ─── Operational control ──────────────────────────────────────────────────────

export const getOperationalLoad = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        // The dashboard reads from the live metrics table updated by the engine heartbeat
        const { data, error } = await supabase
            .from('hospital_metrics')
            .select('*')
            .eq('hospital_id', hospitalId)
            .maybeSingle();

        if (error) throw error;

        // If no metrics yet (new hospital), trigger first recalc
        if (!data) {
            await OperationsService.recalculateMetrics(hospitalId);
            const fresh = await supabase.from('hospital_metrics').select('*').eq('hospital_id', hospitalId).single();
            return res.status(200).json({ success: true, data: fresh.data, error: null });
        }

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const setBookingMode = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { mode } = req.body;
        const VALID_MODES = ['NORMAL', 'RESTRICTED', 'SURGE'];

        if (!VALID_MODES.includes(mode)) {
            return res.status(400).json({ success: false, data: null, error: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}` });
        }

        await OperationsService.setBookingMode(hospitalId, mode as any);
        await OperationsService.recalculateMetrics(hospitalId);

        return res.status(200).json({ success: true, data: { bookingMode: mode }, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const reassignAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { appointmentId } = req.params;
        const { doctor_id } = req.body;
        if (!doctor_id) {
            return res.status(400).json({ success: false, data: null, error: 'doctor_id is required' });
        }
        await OperationsService.reassignAppointment(hospitalId, appointmentId, doctor_id);
        // Sync metrics after reassignment
        await OperationsService.recalculateMetrics(hospitalId).catch(() => { });
        return res.status(200).json({ success: true, data: { appointmentId, newDoctorId: doctor_id }, error: null });
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        return res.status(status).json({ success: false, data: null, error: error.message });
    }
};

export const allocateBed = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { bedId } = req.params;
        const { appointment_id } = req.body;
        if (!appointment_id) {
            return res.status(400).json({ success: false, data: null, error: 'appointment_id is required' });
        }
        await OperationsService.allocateBed(hospitalId, bedId, appointment_id);
        // Sync metrics after bed allocation
        await OperationsService.recalculateMetrics(hospitalId).catch(() => { });
        return res.status(200).json({ success: true, data: { bedId, appointmentId: appointment_id }, error: null });
    } catch (error: any) {
        const status = error.message.includes('occupied') ? 409 : 400;
        return res.status(status).json({ success: false, data: null, error: error.message });
    }
};

export const createDoctor = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { full_name, email, specialization, temporary_password } = req.body;

        if (!full_name || !email || !specialization || !temporary_password) {
            return res.status(400).json({
                success: false,
                data: null,
                error: 'full_name, email, specialization, and temporary_password are required.'
            });
        }

        const result = await AdminService.createDoctor(hospitalId, {
            full_name, email, specialization, temporary_password
        });

        await RealtimeService.broadcast(hospitalId, 'doctors', {
            type: 'DOCTOR_CREATED',
            data: result.doctor
        });

        return res.status(201).json({ success: true, data: result, error: null });
    } catch (error: any) {
        console.error('[createDoctor error]', error);
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getDoctors = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getAllDoctors(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getAllAppointments(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { appointmentId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, data: null, error: 'status is required.' });
        }

        const data = await AdminService.updateAppointmentStatus(hospitalId, appointmentId, status);

        await RealtimeService.notifyAppointmentUpdate(hospitalId, data);

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const updateDoctorStatus = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { doctorId } = req.params;
        const { status } = req.body;
        const data = await AdminService.updateDoctorStatus(hospitalId, doctorId, status);

        await RealtimeService.notifyDoctorAvailability(hospitalId, doctorId, status);
        await OperationsService.recalculateMetrics(hospitalId).catch(() => { });

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const updateDoctorCapacity = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { doctorId } = req.params;
        const { max_active_cases } = req.body;

        if (typeof max_active_cases !== 'number') {
            return res.status(400).json({ success: false, data: null, error: 'max_active_cases must be a number' });
        }

        const data = await AdminService.updateDoctorCapacity(hospitalId, doctorId, max_active_cases);
        await OperationsService.recalculateMetrics(hospitalId).catch(() => { });

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getHospitalMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getHospitalSummary(hospitalId);

        await RealtimeService.notifyAdminDashboard(hospitalId, data);

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getAllUsers(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getBeds = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getAllBeds(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const createBeds = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { type, count } = req.body;
        if (!type || !count) return res.status(400).json({ success: false, error: 'type and count required' });

        const data = await AdminService.createBeds(hospitalId, type, count);
        await OperationsService.recalculateMetrics(hospitalId).catch(() => { });

        return res.status(201).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const releaseBed = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { bedId } = req.params;
        const data = await AdminService.releaseBed(hospitalId, bedId);
        await OperationsService.recalculateMetrics(hospitalId).catch(() => { });
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const updateBedStatus = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { bedId } = req.params;
        const { status } = req.body;
        const data = await AdminService.updateBedStatus(hospitalId, bedId, status);

        await RealtimeService.broadcast(hospitalId, 'metrics', {
            type: 'METRIC_UPDATED',
            data: { type: 'BED_STATUS_CHANGED', bedId, status }
        });

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        // Role mutation guard: role must NEVER be changed via this endpoint
        if (req.body.role !== undefined) {
            return res.status(403).json({
                success: false,
                data: null,
                error: 'Role mutation is forbidden. User roles are immutable after creation.'
            });
        }

        const hospitalId = req.user!.hospital_id;
        const { userId } = req.params;
        const { status } = req.body;
        const data = await AdminService.updateUserStatus(hospitalId, userId, status);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getHospitalInfo = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { data, error } = await supabase
            .from('hospitals')
            .select('*')
            .eq('id', hospitalId)
            .single();
        if (error) throw error;
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getAnalytics(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getReports = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getReports(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const data = await AdminService.getSettings(hospitalId);
        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;

        // Disallow any role-related keys
        if (req.body.role !== undefined) {
            return res.status(403).json({
                success: false,
                data: null,
                error: 'Role mutation is forbidden.'
            });
        }

        const { hospital_name, timezone, notifications_enabled, surge_alert_threshold } = req.body;
        const data = await AdminService.updateSettings(hospitalId, {
            hospital_name,
            timezone,
            notifications_enabled,
            surge_alert_threshold,
        });

        await RealtimeService.broadcast(hospitalId, 'metrics', {
            type: 'SETTINGS_UPDATED',
            data
        });

        return res.status(200).json({ success: true, data, error: null });
    } catch (error: any) {
        return res.status(500).json({ success: false, data: null, error: error.message });
    }
};
