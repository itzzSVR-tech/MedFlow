import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DoctorService } from '../services/doctor.service';
import { supabase } from '../config/supabase';
import { RealtimeService } from '../realtime/realtime.service';

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
        console.error('[DATABASE ERROR] Error fetching doctor by user_id:', error);
        throw new Error(`Database error looking up doctor: ${error.message}`);
    }

    if (data) {
        console.log('[DEBUG] Found existing doctorId:', data.id);
        return data.id;
    }

    // 2. Auto-recovery: If record is missing, create it
    console.warn('[RECOVERY] Missing doctor profile for user:', userId, '. Attempting auto-creation...');

    const { data: newDoctor, error: insertError } = await supabase
        .from('doctors')
        .insert({
            user_id: userId,
            hospital_id: hospitalId,
            specialization: 'General Practice'
        })
        .select()
        .single();

    if (insertError) {
        console.error('[DATABASE ERROR] Failed to auto-create doctor profile:', insertError);
        throw new Error(`Doctor profile auto-creation failed: ${insertError.message}`);
    }

    console.log('[RECOVERY SUCCESS] Created new doctorId:', newDoctor.id);
    return newDoctor.id;
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        console.log('Fetching appointments for doctor:', doctorId);

        // Run both queries in parallel
        const [appointments, weeklyStats] = await Promise.all([
            DoctorService.getMyAppointments(doctorId, hospitalId),
            DoctorService.getWeeklyStats(doctorId, hospitalId),
        ]);

        res.status(200).json({ appointments, weeklyStats });
    } catch (error: any) {
        console.error('getMyAppointments error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const { appointmentId } = req.params;
        const { status } = req.body;
        const result = await DoctorService.updateAppointmentStatus(doctorId, hospitalId, appointmentId, status);

        // Realtime notification
        await RealtimeService.notifyAppointmentUpdate(hospitalId, result);

        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const doctorId = await getDoctorId(req.user!.id, hospitalId);
        const result = await DoctorService.createPrescription(doctorId, hospitalId, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { status } = req.body;
        const result = await DoctorService.updateAvailability(req.user!.id, hospitalId, status);

        // Realtime notification
        await RealtimeService.notifyDoctorAvailability(hospitalId, req.user!.id, status);

        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const result = await DoctorService.getProfile(req.user!.id, hospitalId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const hospitalId = req.user!.hospital_id;
        const { full_name, specialization } = req.body;
        const result = await DoctorService.updateProfile(req.user!.id, hospitalId, { full_name, specialization });
        res.status(200).json(result);
    } catch (error: any) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};

