"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtime = (hospitalId: string, topic: string) => {
    const [lastEvent, setLastEvent] = useState<any>(null);

    useEffect(() => {
        if (!hospitalId) return;

        const channelName = `hospital:${hospitalId}:${topic}`;
        const channel = supabase.channel(channelName)
            .on('broadcast', { event: '*' }, (payload) => {
                console.log(`Realtime update on ${topic}:`, payload);
                setLastEvent(payload);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to ${channelName}`);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [hospitalId, topic]);

    return lastEvent;
};
