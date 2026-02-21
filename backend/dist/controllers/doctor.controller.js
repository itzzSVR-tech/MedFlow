"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAvailability = exports.createPrescription = exports.updateAppointmentStatus = exports.getMyAppointments = void 0;
const doctor_service_1 = require("../services/doctor.service");
const supabase_1 = require("../config/supabase");
const realtime_service_1 = require("../realtime/realtime.service");
// Helper to get doctor_id from user_id
const getDoctorId = async (userId) => {
    const { data, error } = await supabase_1.supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();
    if (error)
        throw error;
    return data.id;
};
const getMyAppointments = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const hospitalId = req.user.hospital_id;
        const result = await doctor_service_1.DoctorService.getMyAppointments(doctorId, hospitalId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyAppointments = getMyAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const hospitalId = req.user.hospital_id;
        const { appointmentId } = req.params;
        const { status } = req.body;
        const result = await doctor_service_1.DoctorService.updateAppointmentStatus(doctorId, hospitalId, appointmentId, status);
        // Realtime notification
        await realtime_service_1.RealtimeService.notifyAppointmentUpdate(hospitalId, result);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const createPrescription = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const hospitalId = req.user.hospital_id;
        const result = await doctor_service_1.DoctorService.createPrescription(doctorId, hospitalId, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPrescription = createPrescription;
const updateAvailability = async (req, res) => {
    try {
        const hospitalId = req.user.hospital_id;
        const { status } = req.body;
        const result = await doctor_service_1.DoctorService.updateAvailability(req.user.id, hospitalId, status);
        // Realtime notification
        await realtime_service_1.RealtimeService.notifyDoctorAvailability(hospitalId, req.user.id, status);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAvailability = updateAvailability;
