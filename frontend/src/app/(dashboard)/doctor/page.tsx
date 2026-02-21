"use client"

import { Card } from "@/components/ui/card"
import {
    Users,
    Clock,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    Search
} from "lucide-react"
import {
    mockDoctorPatients,
    weeklyConsultationsData,
    TriageLevel
} from "@/constants/doctor-mock-data"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function DoctorOverview() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    const stats = [
        { name: "Total Patients Today", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Waiting Patients", value: "12", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "Critical Cases", value: "03", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        { name: "Completed", value: "09", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    ]

    const getTriageColor = (triage: TriageLevel) => {
        switch (triage) {
            case "LOW": return "bg-green-50 text-green-700 border-green-100"
            case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-100"
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-100"
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200 animate-pulse"
            default: return "bg-gray-50 text-gray-700 border-gray-100"
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-3xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[400px] bg-gray-100 rounded-3xl" />
                    <div className="h-[400px] bg-gray-100 rounded-3xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="p-6 rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
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
                            +12.5%
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyConsultationsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="consultations"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Urgent Patients List */}
                <Card className="p-6 rounded-3xl border-none shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Urgent Patients</h3>
                        <Badge variant="outline" className="rounded-full bg-red-50 text-red-600 border-red-100">
                            {mockDoctorPatients.filter(p => p.triage === "CRITICAL").length} Critical
                        </Badge>
                    </div>
                    <div className="space-y-4 flex-1">
                        {mockDoctorPatients
                            .filter(p => p.triage === "CRITICAL" || p.triage === "HIGH")
                            .slice(0, 5)
                            .map((patient) => (
                                <div key={patient.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm", getTriageColor(patient.triage))}>
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                                            <p className="text-xs text-gray-500">{patient.arrivalTime} • {patient.ward}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn("text-[10px] px-2 py-0 border", getTriageColor(patient.triage))}>
                                        {patient.triage}
                                    </Badge>
                                </div>
                            ))}
                    </div>
                    <button className="mt-6 w-full py-3 rounded-2xl border border-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        View All Waiting
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </Card>
            </div>
        </div>
    )
}
