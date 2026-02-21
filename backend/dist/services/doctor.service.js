"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const supabase_1 = require("../config/supabase");
class DoctorService {
    static async getMyAppointments(doctorId, hospitalId) {
        const { data, error } = await supabase_1.supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctorId)
            .eq('hospital_id', hospitalId); // Hospital Isolation
        if (error)
            throw error;
        return data;
    }
    static async updateAppointmentStatus(doctorId, hospitalId, appointmentId, status) {
        const { data, error } = await supabase_1.supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId) // Ensure it's THEIR appointment
            .eq('hospital_id', hospitalId) // Hospital Isolation
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async createPrescription(doctorId, hospitalId, prescriptionData) {
        const { data, error } = await supabase_1.supabase
            .from('prescriptions')
            .insert({
            ...prescriptionData,
            doctor_id: doctorId,
            hospital_id: hospitalId
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async updateAvailability(doctorId, hospitalId, status) {
        const { data, error } = await supabase_1.supabase
            .from('doctors')
            .update({ availability_status: status })
            .eq('user_id', doctorId) // doctorId here refers to internal user_id or doctor_id depending on how it's passed
            .eq('hospital_id', hospitalId)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
exports.DoctorService = DoctorService;
