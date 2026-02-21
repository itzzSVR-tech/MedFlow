"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, AlertTriangle, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

export default function StaffMonitoringPage() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dept, setDept] = useState("All")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get("/admin/doctors")
                const raw = data?.data ?? data
                setDoctors(Array.isArray(raw) ? raw : [])
            } catch (err) {
                toast.error("Failed to load staff performance metrics")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const departments = useMemo(() => ["All", ...Array.from(new Set((Array.isArray(doctors) ? doctors : []).map((s: any) => s.specialization)))], [doctors])

    const stats = useMemo(() => {
        const d = Array.isArray(doctors) ? doctors : []
        const onDuty = d.filter((s: any) => s.availability_status === "available").length
        const avgConsult = 12
        const overloadPct = d.length > 0 ? Math.round((d.filter((s: any) => s.availability_status === "busy").length / d.length) * 100) : 0
        return { onDuty, avgConsult, overloadPct }
    }, [doctors])

    const filtered = useMemo(() => {
        const d = Array.isArray(doctors) ? doctors : []
        return dept === "All" ? d : d.filter((s: any) => s.specialization === dept)
    }, [dept, doctors])

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Staff Monitoring</h2>
                <p className="text-sm text-gray-500 mt-0.5">Doctor workload and duty status from live feed</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { icon: Users, label: "Doctors Available", value: stats.onDuty, unit: "", color: "bg-blue-50 text-blue-600" },
                    { icon: Clock, label: "Est. Consult Time", value: stats.avgConsult, unit: "min", color: "bg-blue-50 text-blue-600" },
                    { icon: AlertTriangle, label: "Capacity Load", value: stats.overloadPct, unit: "%", color: stats.overloadPct > 80 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600" },
                ].map(kpi => (
                    <Card key={kpi.label} className="rounded-[2rem] border-none shadow-sm bg-white p-2">
                        <CardContent className="pt-5 pb-4 px-5 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{kpi.label}</p>
                                <p className="text-2xl font-bold text-slate-900 font-display">
                                    {kpi.value}<span className="text-sm font-medium text-slate-400 ml-1">{kpi.unit}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Department Filters */}
            <div className="flex flex-wrap gap-2">
                {departments.map(d => (
                    <button key={d} onClick={() => setDept(d)}
                        className={`px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${dept === d
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                            : "bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600"
                            }`}>
                        {d}
                    </button>
                ))}
            </div>

            {/* Doctor Table */}
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-6 p-8">
                    <CardTitle className="text-lg font-bold text-slate-900">
                        Workload Matrix — {dept}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                        Real-time status tracking for {filtered.length} specialists
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 text-left">
                                    {["Practitioner", "Specialization", "Contact", "Session Status"].map(h => (
                                        <th key={h} className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {doc.users?.email?.charAt(0).toUpperCase() || "D"}
                                                </div>
                                                <span className="font-bold text-slate-900">{doc.users?.email?.split("@")[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-600 font-medium">{doc.specialization}</td>
                                        <td className="px-8 py-5 text-slate-500 text-xs font-medium">{doc.users?.email}</td>
                                        <td className="px-8 py-5">
                                            <Badge className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase border-none ${doc.availability_status === "available" ? "bg-green-50 text-green-600" :
                                                doc.availability_status === "busy" ? "bg-amber-50 text-amber-600" :
                                                    "bg-slate-100 text-slate-400"
                                                }`}>
                                                {doc.availability_status || "OFF DUTY"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
