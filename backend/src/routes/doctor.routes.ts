import { Router } from 'express';
import * as DoctorController from '../controllers/doctor.controller';
import { roleMiddleware } from '../middlewares/role.middleware';
import { hospitalMiddleware } from '../middlewares/hospital.middleware';

const router = Router();

// All doctor routes require 'doctor' role and hospital association
router.use(roleMiddleware(['doctor']));
router.use(hospitalMiddleware);

router.get('/appointments', DoctorController.getMyAppointments);
router.patch('/appointments/:appointmentId/status', DoctorController.updateAppointmentStatus);
router.post('/prescriptions', DoctorController.createPrescription);
router.get('/profile', DoctorController.getProfile);
router.patch('/profile', DoctorController.updateProfile);
router.patch('/availability', DoctorController.updateAvailability);

export default router;
