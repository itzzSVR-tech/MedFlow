"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import {
    Users, Clock, AlertCircle, CheckCircle2, TrendingUp, ChevronRight, Loader2
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { useAppStore } from "@/store/use-app-store"

export default function DoctorOverview() {
    const { profile } = useAuth();
    const router = useRouter();
    const { activeAppointments: appointments, setAppointments } = useAppStore();
    const [weeklyStats, setWeeklyStats] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(!appointments.length)

    const fetchDashboardData = useCallback(async () => {
        try {
            // If we have appointments, we don't show the full-screen loader
            if (!appointments.length) setIsLoading(true)
            const { data } = await api.get("/doctor/appointments")
            setAppointments(data.appointments || [])
            setWeeklyStats(data.weeklyStats || [])
        } catch (err) {
            console.error("Failed to fetch doctor dashboard:", err)
            // Silently fail if we already have data in store
        } finally {
            setIsLoading(false)
        }
    }, [appointments.length, setAppointments])

    useEffect(() => {
        if (profile) fetchDashboardData()
    }, [profile, fetchDashboardData])

    const today = new Date();
    const todayApps = appointments.filter(a => {
        const appDate = new Date(a.scheduled_at);
        return appDate.toDateString() === today.toDateString();
    });

    const stats = [
        { name: "Total Patients Today", value: todayApps.length.toString().padStart(2, '0'), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Scheduled", value: todayApps.filter(a => a.status?.toLowerCase() === 'scheduled').length.toString().padStart(2, '0'), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "Completed Today", value: todayApps.filter(a => a.status?.toLowerCase() === 'completed').length.toString().padStart(2, '0'), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
        { name: "Critical Pending", value: appointments.filter(a => a.triage === "CRITICAL" && a.status?.toLowerCase() !== 'completed').length.toString().padStart(2, '0'), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    ]

    const getTriageColor = (triage: string) => {
        switch (triage?.toUpperCase()) {
            case "LOW": return "bg-green-50 text-green-700 border-green-100"
            case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-100"
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-100"
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200 animate-pulse"
            default: return "bg-gray-50 text-gray-700 border-gray-100"
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Clinical Overview</h2>
                <div className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    Live System Synchronized
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="p-6 rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-[10px]">{stat.name}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    <AnimatedNumber value={parseInt(stat.value)} />
                                </h3>
                            </div>
                            <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consultation Chart */}
                <Card className="lg:col-span-2 p-6 rounded-3xl border-none shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Consultations This Week</h3>
                            <p className="text-sm text-gray-500">Patient turnaround analytics</p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            <TrendingUp className="w-4 h-4" />
                            Live
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Urgent Patients List */}
                <Card className="p-6 rounded-3xl border-none shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Urgent Patients</h3>
                        <Badge variant="outline" className="rounded-full bg-red-50 text-red-600 border-red-100">
                            {appointments.filter(p => p.triage === "CRITICAL" && p.status !== 'completed').length} Critical
                        </Badge>
                    </div>
                    <div className="space-y-4 flex-1">
                        {appointments
                            .filter(p => (p.triage === "CRITICAL" || p.triage === "HIGH") && p.status !== 'completed')
                            .slice(0, 5)
                            .map((app) => (
                                <div key={app.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all cursor-pointer"
                                    onClick={() => router.push(`/doctor/consultations?id=${app.id}`)}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm", getTriageColor(app.triage))}>
                                            {app.patient_name?.charAt(0) || "P"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{app.patient_name || "Unknown Patient"}</p>
                                            <p className="text-[10px] text-gray-500 font-bold">{new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {app.type}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn("text-[10px] px-2 py-0 border font-bold", getTriageColor(app.triage))}>
                                        {app.triage}
                                    </Badge>
                                </div>
                            ))}
                        {appointments.filter(p => (p.triage === "CRITICAL" || p.triage === "HIGH") && p.status !== 'completed').length === 0 && (
                            <div className="text-center py-20 text-slate-400">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">No urgent patients</p>
                            </div>
                        )}
                    </div>
                    {/* FIXED: "View All Appointments" now navigates to /doctor/patients */}
                    <button
                        onClick={() => router.push('/doctor/patients')}
                        className="mt-6 w-full py-3 rounded-2xl border border-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        View All Appointments
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </Card>
            </div>
        </div>
    )
}
