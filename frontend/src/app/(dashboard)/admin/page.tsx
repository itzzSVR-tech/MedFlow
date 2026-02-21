"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    AreaChart, Area,
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, Minus, Loader2, Hospital, Clock, Users } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRealtime } from "@/hooks/use-realtime"
import api from "@/lib/api"
import { toast } from "sonner"

const kpiAccent: Record<string, string> = {
    appointments: "#3b82f6",
    doctors: "#10b981",
    occupancy: "#f59e0b",
}

function KpiCard({ title, value, unit, trend, trendValue, icon: Icon, id }: any) {
    const color = kpiAccent[id] ?? "#3b82f6"

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all">
            <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-bold text-gray-900 leading-none">
                            {value}
                            {unit && <span className="text-lg font-semibold text-gray-400 ml-0.5">{unit}</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                            <ArrowUpRight className="h-3 w-3" />
                            Live Syncing
                        </div>
                    </div>
                    <div className={cn("p-3 rounded-2xl bg-opacity-10", id === 'appointments' ? 'bg-blue-500' : id === 'doctors' ? 'bg-green-500' : 'bg-amber-500')}>
                        <Icon className={cn("w-6 h-6", id === 'appointments' ? 'text-blue-500' : id === 'doctors' ? 'text-green-500' : 'text-amber-500')} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

import { cn } from "@/lib/utils"

export default function AdminDashboard() {
    const { profile } = useAuth();
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchMetrics = async () => {
        try {
            const { data } = await api.get("/admin/metrics")
            setMetrics(data.data ?? data)
        } catch (err) {
            console.error("Failed to fetch metrics:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMetrics()
    }, [])

    // Real-time listeners
    const doctorEvent = useRealtime(profile?.hospital_id || "", "doctors");
    const appointmentEvent = useRealtime(profile?.hospital_id || "", "appointments");
    const metricEvent = useRealtime(profile?.hospital_id || "", "metrics");

    useEffect(() => {
        if (doctorEvent || appointmentEvent || metricEvent) {
            fetchMetrics()
        }
    }, [doctorEvent, appointmentEvent, metricEvent]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Operations Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Real-time hospital intelligence system</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 font-bold text-xs uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live Dashboard
                </div>
            </div>

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    id="appointments"
                    title="Today's Appointments"
                    value={metrics?.appointmentsToday || 0}
                    icon={Clock}
                />
                <KpiCard
                    id="doctors"
                    title="Doctors On Duty"
                    value={metrics?.activeDoctors || 0}
                    icon={Users}
                />
                <KpiCard
                    id="occupancy"
                    title="Bed Occupancy"
                    value={metrics?.bedOccupancy || 0}
                    unit="%"
                    icon={Hospital}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white overflow-hidden">
                    <CardHeader className="px-0 pt-0 pb-6">
                        <CardTitle className="text-lg font-bold">Patient Inflow</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity last 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics?.hourlyInflow || []}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-6">
                        <CardTitle className="text-lg font-bold">Resource Allocation</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Current bed distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 flex-1 flex flex-col justify-center">
                        <div className="space-y-6">
                            <ResourceBar label="General Ward" value={metrics?.bedDistribution?.General || 0} total={metrics?.bedDistribution?.TotalGeneral || 0} color="bg-blue-500" />
                            <ResourceBar label="ICU / Emergency" value={metrics?.bedDistribution?.ICU || 0} total={metrics?.bedDistribution?.TotalICU || 0} color="bg-red-500" />
                            <ResourceBar label="Surgical Unit / Isolation" value={metrics?.bedDistribution?.Isolation || 0} total={metrics?.bedDistribution?.TotalIsolation || 0} color="bg-amber-500" />
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Beds</p>
                                <p className="text-2xl font-bold text-slate-900">{(metrics?.totalBeds - metrics?.occupiedBeds) || 0}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Live Status</p>
                                <p className="text-2xl font-bold text-blue-600">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ResourceBar({ label, value, total, color }: any) {
    const pct = Math.round((value / total) * 100)
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className="text-[10px] font-bold text-slate-400">{value} / {total} BEDS</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

