import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PatientService } from '../services/patient.service';

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const data = await PatientService.getMyAppointments(req.user!.id, req.user!.hospital_id);
        res.status(200).json(data);
    } catch (error: any) {
        console.error('getMyAppointments (patient) error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const { doctor_id, scheduled_at, symptoms, urgency } = req.body;
        const appointment = await PatientService.createAppointment(
            req.user!.id,
            req.user!.hospital_id,
            { doctor_id, scheduled_at, symptoms, urgency }
        );
        res.status(201).json(appointment);
    } catch (error: any) {
        console.error('createAppointment (patient) error:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

export const getMyPrescriptions = async (req: AuthRequest, res: Response) => {
    try {
        const data = await PatientService.getMyPrescriptions(req.user!.id, req.user!.hospital_id);
        res.status(200).json(data);
    } catch (error: any) {
        console.error('getMyPrescriptions (patient) error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getAvailableDoctors = async (req: AuthRequest, res: Response) => {
    try {
        const data = await PatientService.getAvailableDoctors(req.user!.hospital_id);
        res.status(200).json(data);
    } catch (error: any) {
        console.error('getAvailableDoctors (patient) error:', error);
        res.status(500).json({ message: error.message });
    }
};
