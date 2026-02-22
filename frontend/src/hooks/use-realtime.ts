"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useRealtime = (
    hospitalId: string,
    topic: string,
    onEvent?: (payload: any) => void
) => {
    const [lastEvent, setLastEvent] = useState<any>(null);

    useEffect(() => {
        if (!hospitalId) return;

        const channelName = `hospital:${hospitalId}:${topic}`;
        const channel = supabase.channel(channelName)
            .on('broadcast', { event: '*' }, (payload) => {
                const data = payload.payload || payload;
                setLastEvent(data);

                // Active feedback: Toast notifications for critical events
                if (data.type === 'METRICS_UPDATED' && data.data?.trigger === 'appointment_status_changed') {
                    toast.info(`System Sync: ${data.data.status || 'Updates broadcasted'}`);
                }

                if (data.type === 'APPOINTMENT_UPDATED') {
                    const status = data.data?.status;
                    if (status === 'admitted') toast.success("Patient Admitted to Bed");
                    if (status === 'waiting_for_bed') toast.error("Resource Alert: Patient waiting for bed");
                }

                if (onEvent) onEvent(data);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [hospitalId, topic, onEvent]);

    return lastEvent;
};
