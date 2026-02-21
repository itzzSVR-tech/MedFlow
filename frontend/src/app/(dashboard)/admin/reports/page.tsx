"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts"
import { FileBarChart2, Download, FileText, Table, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ReportData {
    appointmentsPerDay: { date: string; total: number; completed: number }[]
    bedUtilization: { type: string; total: number; occupied: number; utilizationPct: number }[]
    doctorLoad: { doctorName: string; specialization: string; appointmentsThisWeek: number }[]
    totals: {
        allTime: number
        completed: number
        totalBeds: number
        occupiedBeds: number
    }
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

function downloadCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        toast.error("No data to export.")
        return
    }
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true)
    const [reports, setReports] = useState<ReportData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const { data } = await api.get("/admin/reports")
            setReports(data.data ?? data)
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message
            setError(msg)
            toast.error("Failed to load reports")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !reports) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">{error || "Failed to load reports"}</p>
                <Button variant="outline" onClick={fetchReports} className="rounded-xl font-bold border-gray-200">
                    Try Again
                </Button>
            </div>
        )
    }

    const { appointmentsPerDay, bedUtilization, doctorLoad, totals } = reports

    const summaryCards = [
        { label: "All-Time Appointments", value: totals.allTime, color: "text-blue-600", bg: "bg-blue-50", icon: FileText },
        { label: "Completed", value: totals.completed, color: "text-green-600", bg: "bg-green-50", icon: FileBarChart2 },
        { label: "Total Beds", value: totals.totalBeds, color: "text-amber-600", bg: "bg-amber-50", icon: Table },
        { label: "Occupied Beds", value: totals.occupiedBeds, color: "text-purple-600", bg: "bg-purple-50", icon: Table },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Reports</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Live operational data — last 7 days</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchReports} className="rounded-xl border-gray-200 h-10 w-10">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((c) => (
                    <Card key={c.label} className="p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl", c.bg)}>
                                <c.icon className={cn("w-4 h-4", c.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
                                <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Appointments Per Day Chart */}
            <Card className="p-6 rounded-3xl border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900">Daily Appointments (Last 7 Days)</h3>
                        <p className="text-xs text-gray-500">Total vs completed consultations</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCSV(appointmentsPerDay, "daily_appointments")}
                        className="rounded-xl border-gray-200 font-bold text-xs gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </Button>
                </div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={appointmentsPerDay} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)' }} />
                            <Legend />
                            <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bed Utilization */}
                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Bed Utilization</h3>
                            <p className="text-xs text-gray-500">By ward type</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCSV(bedUtilization, "bed_utilization")}
                            className="rounded-xl border-gray-200 font-bold text-xs gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {bedUtilization.map((bed, i) => (
                            <div key={bed.type}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-bold text-gray-700">{bed.type}</span>
                                    <span className="text-xs font-bold text-gray-400">{bed.occupied}/{bed.total} beds · {bed.utilizationPct}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${bed.utilizationPct}%`,
                                            backgroundColor: COLORS[i % COLORS.length]
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {bedUtilization.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-8">No bed data available</p>
                        )}
                    </div>
                </Card>

                {/* Doctor Load */}
                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Doctor Load</h3>
                            <p className="text-xs text-gray-500">Appointments per doctor (7 days)</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCSV(doctorLoad, "doctor_load")}
                            className="rounded-xl border-gray-200 font-bold text-xs gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {doctorLoad.sort((a, b) => b.appointmentsThisWeek - a.appointmentsThisWeek).map((doc, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                    {doc.doctorName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{doc.doctorName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{doc.specialization}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-base font-bold text-blue-600">{doc.appointmentsThisWeek}</p>
                                    <p className="text-[10px] text-gray-400">appts</p>
                                </div>
                            </div>
                        ))}
                        {doctorLoad.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-8">No doctor data available</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
