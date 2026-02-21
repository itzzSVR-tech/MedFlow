import { supabase } from '../config/supabase';

export class RealtimeService {
    /**
     * Broadcasts an event to a hospital-scoped channel.
     * Channel pattern: hospital:{hospital_id}:{topic}
     */
    static async broadcast(hospitalId: string, topic: string, payload: any) {
        const channelName = `hospital:${hospitalId}:${topic}`;

        // Supabase Realtime using broadcast
        const channel = supabase.channel(channelName);

        await channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'update',
                    payload
                });
                // Clean up channel after sending
                supabase.removeChannel(channel);
            }
        });
    }

    static async notifyAppointmentUpdate(hospitalId: string, appointment: any) {
        await this.broadcast(hospitalId, 'appointments', {
            type: 'APPOINTMENT_UPDATED',
            data: appointment
        });
    }

    static async notifyDoctorAvailability(hospitalId: string, doctorId: string, status: string) {
        await this.broadcast(hospitalId, 'doctors', {
            type: 'DOCTOR_STATUS_CHANGED',
            doctorId,
            status
        });
    }

    static async notifyAdminDashboard(hospitalId: string, metrics: any) {
        await this.broadcast(hospitalId, 'dashboard', {
            type: 'METRICS_UPDATED',
            data: metrics
        });
    }
}
