"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const supabase_1 = require("../config/supabase");
class RealtimeService {
    /**
     * Broadcasts an event to a hospital-scoped channel.
     * Channel pattern: hospital:{hospital_id}:{topic}
     */
    static async broadcast(hospitalId, topic, payload) {
        const channelName = `hospital:${hospitalId}:${topic}`;
        // Supabase Realtime using broadcast
        const channel = supabase_1.supabase.channel(channelName);
        await channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'update',
                    payload
                });
                // Clean up channel after sending
                supabase_1.supabase.removeChannel(channel);
            }
        });
    }
    static async notifyAppointmentUpdate(hospitalId, appointment) {
        await this.broadcast(hospitalId, 'appointments', {
            type: 'APPOINTMENT_UPDATED',
            data: appointment
        });
    }
    static async notifyDoctorAvailability(hospitalId, doctorId, status) {
        await this.broadcast(hospitalId, 'doctors', {
            type: 'DOCTOR_STATUS_CHANGED',
            doctorId,
            status
        });
    }
    static async notifyAdminDashboard(hospitalId, metrics) {
        await this.broadcast(hospitalId, 'dashboard', {
            type: 'METRICS_UPDATED',
            data: metrics
        });
    }
}
exports.RealtimeService = RealtimeService;
