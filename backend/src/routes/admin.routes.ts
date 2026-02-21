import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { roleMiddleware } from '../middlewares/role.middleware';
import { hospitalMiddleware } from '../middlewares/hospital.middleware';

const router = Router();

// All admin routes require 'admin' role and hospital association
router.use(roleMiddleware(['admin']));
router.use(hospitalMiddleware);

// Doctors
router.post('/doctors', AdminController.createDoctor);
router.get('/doctors', AdminController.getDoctors);
router.patch('/doctors/:doctorId/status', AdminController.updateDoctorStatus);

// Appointments (admins can view and cancel appointments)
router.get('/appointments', AdminController.getAppointments);
router.patch('/appointments/:appointmentId/status', AdminController.updateAppointmentStatus);

// Dashboard metrics and analytics
router.get('/metrics', AdminController.getHospitalMetrics);
router.get('/analytics', AdminController.getAnalytics);

// Hospital info
router.get('/hospital', AdminController.getHospitalInfo);

// Users
router.get('/users', AdminController.getUsers);
router.patch('/users/:userId/status', AdminController.updateUserStatus);

// Beds
router.get('/beds', AdminController.getBeds);
router.patch('/beds/:bedId', AdminController.updateBedStatus);

// Reports (live aggregated data)
router.get('/reports', AdminController.getReports);

// Settings (per-tenant configuration)
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

export default router;
