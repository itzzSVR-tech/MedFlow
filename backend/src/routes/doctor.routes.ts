import { Router } from 'express';
import * as DoctorController from '../controllers/doctor.controller';
import { roleMiddleware } from '../middlewares/role.middleware';
import { hospitalMiddleware } from '../middlewares/hospital.middleware';

const router = Router();

// All doctor routes require 'doctor' role and hospital association
router.use(roleMiddleware(['doctor']));
router.use(hospitalMiddleware);

// ── Appointments (priority-sorted, strict status transitions) ─────────────────
router.get('/appointments', DoctorController.getMyAppointments);
router.get('/load', DoctorController.getDoctorLoad);
router.patch('/appointments/:appointmentId/status', DoctorController.updateAppointmentStatus);
router.patch('/appointments/:appointmentId/outcome', DoctorController.setOutcome);

// ── Prescriptions ─────────────────────────────────────────────────────────────
router.post('/prescriptions', DoctorController.createPrescription);

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/profile', DoctorController.getProfile);
router.patch('/profile', DoctorController.updateProfile);
router.patch('/availability', DoctorController.updateAvailability);

export default router;
