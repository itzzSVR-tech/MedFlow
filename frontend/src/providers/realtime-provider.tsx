"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/use-app-store'
import { toast } from 'sonner'

const RealtimeContext = createContext<any>(null)

export function RealtimeProvider({
    hospitalId,
    children
}: {
    hospitalId: string,
    children: React.ReactNode
}) {
    const { updateMetric, updateAppointment, addAppointment } = useAppStore()

    useEffect(() => {
        if (!hospitalId) return

        console.log(`[Realtime] Initializing global sync for hospital: ${hospitalId}`)

        const channel = supabase.channel(`hospital:${hospitalId}:ops`)
            .on('broadcast', { event: '*' }, (payload) => {
                const { type, data } = payload.payload || payload

                console.log(`[Realtime] Event Received: ${type}`, data)

                switch (type) {
                    case 'METRICS_UPDATED':
                        // Logic to update metrics slice
                        // if data contains specific metric keys, update them
                        if (data?.trigger === 'appointment_status_changed') {
                            // Trigger a re-fetch of core metrics or update optimistically
                        }
                        break

                    case 'APPOINTMENT_UPDATED':
                        updateAppointment(data.id, data)
                        if (data.status === 'admitted') toast.success(`Patient ${data.patient_name || 'admitted'} to bed`)
                        if (data.status === 'waiting_for_bed') toast.error("Resource Alert: Patient waiting for bed")
                        break

                    case 'APPOINTMENT_CREATED':
                        addAppointment(data)
                        toast.info(`New Appointment: ${data.patient_name || 'Received'}`)
                        break

                    default:
                        console.log("Unhandled Realtime Event", type)
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Realtime] Connected to hospital stream: ${hospitalId}`)
                }
            })

        return () => {
            console.log(`[Realtime] Cleaning up hospital stream: ${hospitalId}`)
            supabase.removeChannel(channel)
        }
    }, [hospitalId, updateMetric, updateAppointment, addAppointment])

    return (
        <RealtimeContext.Provider value={{}}>
            {children}
        </RealtimeContext.Provider>
    )
}

export const useRealtimeOps = () => useContext(RealtimeContext)
