"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/use-app-store'
import { toast } from 'sonner'
import api from '@/lib/api'

const RealtimeContext = createContext<any>(null)

export function RealtimeProvider({
    hospitalId,
    children
}: {
    hospitalId: string,
    children: React.ReactNode
}) {
    const { setMetrics, updateAppointment, addAppointment } = useAppStore()

    const handleMetricsUpdate = async () => {
        try {
            console.log("[Realtime] Fetching fresh metrics due to update signal...")
            const { data } = await api.get("/admin/metrics")
            setMetrics(data.data ?? data)
        } catch (err) {
            console.error("[Realtime] Failed to refresh metrics:", err)
        }
    }

    useEffect(() => {
        if (!hospitalId) return

        console.log(`[Realtime] Initializing multi-topic sync for hospital: ${hospitalId}`)

        // 1. Dashboard & Metrics Channel
        const dashboardChannel = supabase.channel(`hospital:${hospitalId}:dashboard`)
            .on('broadcast', { event: 'update' }, (payload) => {
                const { type, data } = payload.payload || payload
                console.log(`[Realtime:Dashboard] Event: ${type}`, data)

                switch (type) {
                    case 'METRICS_UPDATED':
                        handleMetricsUpdate()
                        break
                    case 'BOOKING_MODE_CHANGED':
                        toast.warning(`Hospital Operating Mode changed: ${data.mode}`)
                        handleMetricsUpdate()
                        break
                    case 'CRITICAL_WAIT_ALERT':
                        toast.error(`CRITICAL ALERT: Patient waiting over ${data.waitMinutes} mins!`)
                        break
                }
            })
            .subscribe()

        // 2. Appointments & Ops Channel
        const opsChannel = supabase.channel(`hospital:${hospitalId}:appointments`)
            .on('broadcast', { event: 'update' }, (payload) => {
                const { type, data } = payload.payload || payload
                console.log(`[Realtime:Ops] Event: ${type}`, data)

                switch (type) {
                    case 'APPOINTMENT_UPDATED':
                        updateAppointment(data.id, data)
                        if (data.status === 'admitted') toast.success(`Patient admitted to bed`)
                        if (data.status === 'waiting_for_bed') toast.error("Resource Alert: Patient waiting for bed")
                        break
                    case 'APPOINTMENT_CREATED':
                        addAppointment(data)
                        toast.info(`New Patient Received: ${data.patient_name || 'Anonymous'}`)
                        break
                    case 'APPOINTMENT_REASSIGNED':
                        updateAppointment(data.appointmentId, data.appointment)
                        toast.info(`Appointment re-assigned to Dr. ${data.newDoctorId}`)
                        break
                }
            })
            .subscribe()

        // 3. Beds Channel
        const bedChannel = supabase.channel(`hospital:${hospitalId}:beds`)
            .on('broadcast', { event: 'update' }, (payload) => {
                const { type, data } = payload.payload || payload
                console.log(`[Realtime:Beds] Event: ${type}`, data)
                if (type === 'BED_ALLOCATED') {
                    handleMetricsUpdate() // Bed occupancy changed
                }
            })
            .subscribe()

        return () => {
            console.log(`[Realtime] Cleaning up hospital streams: ${hospitalId}`)
            supabase.removeChannel(dashboardChannel)
            supabase.removeChannel(opsChannel)
            supabase.removeChannel(bedChannel)
        }
    }, [hospitalId, setMetrics, updateAppointment, addAppointment])

    return (
        <RealtimeContext.Provider value={{ refreshMetrics: handleMetricsUpdate }}>
            {children}
        </RealtimeContext.Provider>
    )
}

export const useRealtimeOps = () => useContext(RealtimeContext)
