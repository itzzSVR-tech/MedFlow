"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHospitalInfo = exports.getHospitalMetrics = exports.updateDoctorStatus = exports.getAppointments = exports.getDoctors = exports.createDoctor = void 0;
const admin_service_1 = require("../services/admin.service");
const supabase_1 = require("../config/supabase");
const realtime_service_1 = require("../realtime/realtime.service");
const createDoctor = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const result = await admin_service_1.AdminService.createDoctor(hospitalId, req.body);
        // Realtime notification
        await realtime_service_1.RealtimeService.broadcast(hospitalId, 'doctors', { type: 'DOCTOR_CREATED', data: result.doctor });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createDoctor = createDoctor;
const getDoctors = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const result = await admin_service_1.AdminService.getAllDoctors(hospitalId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDoctors = getDoctors;
const getAppointments = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const result = await admin_service_1.AdminService.getAllAppointments(hospitalId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAppointments = getAppointments;
const updateDoctorStatus = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const { doctorId } = req.params;
        const { status } = req.body;
        const result = await admin_service_1.AdminService.updateDoctorStatus(hospitalId, doctorId, status);
        // Realtime notification
        await realtime_service_1.RealtimeService.notifyDoctorAvailability(hospitalId, doctorId, status);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateDoctorStatus = updateDoctorStatus;
const getHospitalMetrics = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const metrics = await admin_service_1.AdminService.getDashboardMetrics(hospitalId);
        // Pre-broadcast update to admin dashboard
        await realtime_service_1.RealtimeService.notifyAdminDashboard(hospitalId, metrics);
        res.status(200).json(metrics);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getHospitalMetrics = getHospitalMetrics;
const getHospitalInfo = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const { data, error } = await supabase_1.supabase
            .from('hospitals')
            .select('*')
            .eq('id', hospitalId)
            .single();
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getHospitalInfo = getHospitalInfo;
