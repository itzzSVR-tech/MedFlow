"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const supabase_1 = require("../config/supabase");
class AdminService {
    static async createDoctor(hospitalId, doctorData) {
        // 1. Create entry in users table
        const { data: user, error: userError } = await supabase_1.supabase
            .from('users')
            .insert({
            firebase_uid: doctorData.firebase_uid,
            email: doctorData.email,
            role: 'doctor',
            hospital_id: hospitalId
        })
            .select()
            .single();
        if (userError)
            throw userError;
        // 2. Create entry in doctors table
        const { data: doctor, error: doctorError } = await supabase_1.supabase
            .from('doctors')
            .insert({
            user_id: user.id,
            hospital_id: hospitalId,
            specialization: doctorData.specialization
        })
            .select()
            .single();
        if (doctorError)
            throw doctorError;
        return { user, doctor };
    }
    static async getAllDoctors(hospitalId) {
        const { data, error } = await supabase_1.supabase
            .from('doctors')
            .select('*, users(*)')
            .eq('hospital_id', hospitalId);
        if (error)
            throw error;
        return data;
    }
    static async getAllAppointments(hospitalId) {
        const { data, error } = await supabase_1.supabase
            .from('appointments')
            .select('*, doctors(users(*))')
            .eq('hospital_id', hospitalId);
        if (error)
            throw error;
        return data;
    }
    static async updateDoctorStatus(hospitalId, doctorId, status) {
        const { data, error } = await supabase_1.supabase
            .from('doctors')
            .update({ availability_status: status })
            .eq('id', doctorId)
            .eq('hospital_id', hospitalId)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async getDashboardMetrics(hospitalId) {
        // 1. Total Appointments Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { count: totalAppointments } = await supabase_1.supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('hospital_id', hospitalId)
            .gte('scheduled_at', startOfDay.toISOString());
        // 2. Active Doctors
        const { count: activeDoctors } = await supabase_1.supabase
            .from('doctors')
            .select('*', { count: 'exact', head: true })
            .eq('hospital_id', hospitalId)
            .eq('availability_status', 'available');
        // 3. Bed Occupancy
        const { data: beds } = await supabase_1.supabase
            .from('beds')
            .select('status')
            .eq('hospital_id', hospitalId);
        const totalBeds = beds?.length || 0;
        const occupiedBeds = beds?.filter(b => b.status === 'Occupied').length || 0;
        const bedOccupancyPct = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
        return {
            appointmentsToday: totalAppointments || 0,
            activeDoctors: activeDoctors || 0,
            bedOccupancy: Math.round(bedOccupancyPct),
            totalBeds,
            occupiedBeds
        };
    }
}
exports.AdminService = AdminService;
