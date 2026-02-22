import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { roleMiddleware } from '../middlewares/role.middleware';
import { hospitalMiddleware } from '../middlewares/hospital.middleware';

const router = Router();

// All admin routes require 'admin' role and hospital association
router.use(roleMiddleware(['admin']));
router.use(hospitalMiddleware);

// ── Operational Intelligence ──────────────────────────────────────────────────
router.get('/load', AdminController.getOperationalLoad);                              // full snapshot + alerts
router.post('/booking-mode', AdminController.setBookingMode);                         // { mode: 'NORMAL'|'RESTRICTED'|'SURGE' }
router.post('/surge-mode', AdminController.setBookingMode);                           // backward compatibility alias
router.post('/appointments/:appointmentId/reassign', AdminController.reassignAppointment); // { doctor_id }
router.post('/beds', AdminController.createBeds);                          // { type, count }
router.post('/beds/:bedId/allocate', AdminController.allocateBed);                    // { appointment_id }
router.post('/beds/:bedId/release', AdminController.releaseBed);                      // Manual release

// ── Doctors ───────────────────────────────────────────────────────────────────
router.post('/doctors', AdminController.createDoctor);
router.get('/doctors', AdminController.getDoctors);
router.patch('/doctors/:doctorId/status', AdminController.updateDoctorStatus);
router.patch('/doctors/:doctorId/capacity', AdminController.updateDoctorCapacity);     // { max_active_cases }

// ── Appointments ──────────────────────────────────────────────────────────────
router.get('/appointments', AdminController.getAppointments);
router.patch('/appointments/:appointmentId/status', AdminController.updateAppointmentStatus);

// ── Dashboard metrics and analytics ──────────────────────────────────────────
router.get('/metrics', AdminController.getHospitalMetrics);
router.get('/analytics', AdminController.getAnalytics);

// ── Hospital info ─────────────────────────────────────────────────────────────
router.get('/hospital', AdminController.getHospitalInfo);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', AdminController.getUsers);
router.patch('/users/:userId/status', AdminController.updateUserStatus);

// ── Beds ──────────────────────────────────────────────────────────────────────
router.get('/beds', AdminController.getBeds);
router.patch('/beds/:bedId', AdminController.updateBedStatus);

// ── Reports and Settings ──────────────────────────────────────────────────────
router.get('/reports', AdminController.getReports);
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

export default router;
