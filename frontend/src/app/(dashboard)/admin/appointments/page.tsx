"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Stethoscope, Loader2, RefreshCw, XCircle, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRealtime } from "@/hooks/use-realtime"

interface Appointment {
    id: string
    patient_name?: string
    status: string
    scheduled_at: string
    triage?: string
    symptoms?: string
    doctors?: { users?: { full_name?: string } }
}

const STATUS_STYLES: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
}

const TRIAGE_STYLES: Record<string, string> = {
    LOW: "bg-green-50 text-green-700 border-green-100",
    MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-100",
    HIGH: "bg-orange-50 text-orange-700 border-orange-100",
    CRITICAL: "bg-red-50 text-red-700 border-red-200",
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", color)}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </Card>
    )
}

export default function AppointmentsPage() {
    const { profile } = useAuth()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await api.get("/admin/appointments")
            setAppointments(data.data ?? data)
        } catch (err) {
            toast.error("Failed to load appointments")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    const appointmentEvent = useRealtime(profile?.hospital_id || "", "appointments")
    useEffect(() => {
        if (appointmentEvent?.type === 'APPOINTMENT_UPDATED') {
            fetchAppointments()
        }
    }, [appointmentEvent, fetchAppointments])

    const handleCancel = async (appointmentId: string) => {
        if (cancellingId) return
        try {
            setCancellingId(appointmentId)
            await api.patch(`/admin/appointments/${appointmentId}/status`, { status: "cancelled" })
            setAppointments(prev => prev.map(a =>
                a.id === appointmentId ? { ...a, status: "cancelled" } : a
            ))
            toast.success("Appointment cancelled.")
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message
            toast.error(`Failed to cancel: ${msg}`)
        } finally {
            setCancellingId(null)
        }
    }

    const todayStr = new Date().toDateString()
    const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === todayStr)
    const scheduled = appointments.filter(a => a.status === "scheduled")
    const completed = appointments.filter(a => a.status === "completed")
    const critical = appointments.filter(a => a.triage === "CRITICAL" && a.status !== "cancelled")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-sm text-gray-500">{appointments.length} total appointments</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchAppointments} className="rounded-xl border-gray-200 h-10 w-10">
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Today" value={todayAppts.length} icon={Calendar} color="bg-blue-50 text-blue-600" />
                <StatCard label="Scheduled" value={scheduled.length} icon={CheckCircle} color="bg-amber-50 text-amber-600" />
                <StatCard label="Completed" value={completed.length} icon={CheckCircle} color="bg-green-50 text-green-600" />
                <StatCard label="Critical" value={critical.length} icon={AlertCircle} color="bg-red-50 text-red-600" />
            </div>

            {/* Appointments Table */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Triage</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scheduled</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-bold">No appointments found</p>
                                        </td>
                                    </tr>
                                ) : appointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                                                    {(appt.patient_name || "W").charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-none">
                                                        {appt.patient_name || "Walk-in Patient"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{appt.symptoms || "—"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {appt.doctors?.users?.full_name || "Unassigned"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {appt.triage ? (
                                                <Badge className={cn("text-[9px] px-2.5 py-1 border-none rounded-full font-bold uppercase", TRIAGE_STYLES[appt.triage] || "bg-gray-50 text-gray-500")}>
                                                    {appt.triage}
                                                </Badge>
                                            ) : <span className="text-xs text-gray-400">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 font-medium">
                                                {new Date(appt.scheduled_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn("text-[10px] rounded-full px-3 py-1 font-bold uppercase tracking-wider", STATUS_STYLES[appt.status] || "bg-gray-50 text-gray-500")}>
                                                {appt.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {appt.status === "scheduled" ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={cancellingId === appt.id}
                                                    onClick={() => handleCancel(appt.id)}
                                                    className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs gap-1.5 h-8"
                                                >
                                                    {cancellingId === appt.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    )}
                                                    Cancel
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-gray-300 font-bold">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}
