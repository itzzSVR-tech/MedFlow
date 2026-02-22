import { Router } from 'express';
import * as PatientController from '../controllers/patient.controller';
import { roleMiddleware } from '../middlewares/role.middleware';
import { hospitalMiddleware } from '../middlewares/hospital.middleware';

const router = Router();

// All patient routes require 'patient' role and hospital association
router.use(roleMiddleware(['patient']));
router.use(hospitalMiddleware);

// Appointments
router.get('/appointments', PatientController.getMyAppointments);
router.post('/appointments', PatientController.createAppointment);

// Prescriptions (read-only for patient)
router.get('/prescriptions', PatientController.getMyPrescriptions);

// Available doctors for booking
router.get('/doctors', PatientController.getAvailableDoctors);

export default router;
