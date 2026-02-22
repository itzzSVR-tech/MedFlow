import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DoctorService } from '../services/doctor.service';
import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';
import { OperationsService } from '../services/operations.service';

// Helper to get doctor_id from user_id (with auto-recovery for missing profiles)
const getDoctorId = async (userId: string, hospitalId: string) => {
    console.log('[DEBUG] getDoctorId for user:', userId, 'hospital:', hospitalId);

    // 1. Try to find existing doctor profile
    const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        throw new Error(`Database error looking up doctor: ${error.message}`);
    }

    if (data) return data.id;

    // 2. Auto-recovery: If record is missing, create it
    const { data: newDoctor, error: insertError } = await supabase
        .from('doctors')
        .insert({
            user_id: userId,
            hospital_id: hospitalId,
            specialization: 'General Practice'
        })
        .select()
        .single();

    if (insertError) throw new Error(`Doctor profile auto-creation failed: ${insertError.message}`);
    return newDoctor.id;
};

const handleError = (err: any, res: Response) => {
    console.error('[ERROR]', err);
    res.status(500).json({ success: false, message: err.message });
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const [appointments, weeklyStats] = await Promise.all([
            DoctorService.getMyAppointments(doctorId, hospitalId),
            DoctorService.getWeeklyStats(doctorId, hospitalId),
        ]);
        res.status(200).json({ appointments, weeklyStats });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const getDoctorLoad = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const load = await OperationsService.calculateDoctorLoad(hospitalId);
        const myLoad = load.find(d => d.doctor_id === doctorId);

        // Resilient fallback: If no load data found, return a default "available" state
        if (!myLoad) {
            console.warn(`[WARN] No load data found for doctorId=${doctorId}. Returning default state.`);
            return res.json({
                success: true,
                load: {
                    doctor_id: doctorId,
                    doctor_name: 'Unknown',
                    active_appointments: 0,
                    max_active_cases: 5,
                    load_pct: 0,
                    is_overloaded: false
                }
            });
        }
        res.json({ success: true, load: myLoad });
    } catch (err) {
        handleError(err as Error, res);
    }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const { appointmentId } = req.params;
        const { status } = req.body;
        const result = await DoctorService.updateAppointmentStatus(doctorId, hospitalId, appointmentId, status);
        await RealtimeService.notifyAppointmentUpdate(hospitalId, result);
        res.status(200).json(result);
    } catch (error: any) {
        handleError(error, res);
    }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const result = await DoctorService.createPrescription(doctorId, hospitalId, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        handleError(error, res);
    }
};

export const setOutcome = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const { appointmentId } = req.params;
        const { outcome } = req.body;
        if (!outcome) return res.status(400).json({ message: 'outcome is required' });
        const result = await DoctorService.setOutcome(doctorId, hospitalId, appointmentId, outcome);
        res.status(200).json(result);
    } catch (error: any) {
        handleError(error, res);
    }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { status } = req.body;
        const result = await DoctorService.updateAvailability(req.user!.id, hospitalId, status);
        await RealtimeService.notifyDoctorAvailability(hospitalId, req.user!.id, status);
        await OperationsService.recalculateMetrics(hospitalId);
        res.status(200).json(result);
    } catch (error: any) {
        handleError(error, res);
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const result = await DoctorService.getProfile(req.user!.id, hospitalId);
        res.status(200).json(result);
    } catch (error: any) {
        handleError(error, res);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { full_name, specialization } = req.body;
        const result = await DoctorService.updateProfile(req.user!.id, hospitalId, { full_name, specialization });
        res.status(200).json(result);
    } catch (error: any) {
        handleError(error, res);
    }
};
