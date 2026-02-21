"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockStaff, type StaffMember } from "@/constants/mock-data"
import { Users, Clock, AlertTriangle } from "lucide-react"

const departments = ["All", ...Array.from(new Set(mockStaff.map(s => s.department)))]

export default function StaffMonitoringPage() {
    const [dept, setDept] = useState("All")
    const filtered = dept === "All" ? mockStaff : mockStaff.filter(s => s.department === dept)

    const onDuty = mockStaff.filter(s => s.status !== "Off Duty").length
    const avgConsult = Math.round(mockStaff.reduce((a, s) => a + s.avgConsultTime, 0) / mockStaff.length)
    const overloadPct = Math.round((mockStaff.filter(s => s.status === "Overloaded").length / mockStaff.length) * 100)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Staff Monitoring</h2>
                <p className="text-sm text-gray-500 mt-0.5">Doctor workload and duty status</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { icon: Users, label: "Doctors on Duty", value: onDuty, unit: "", color: "bg-blue-50 text-blue-600" },
                    { icon: Clock, label: "Avg Consult Time", value: avgConsult, unit: "min", color: "bg-blue-50 text-blue-600" },
                    { icon: AlertTriangle, label: "Overload Risk", value: overloadPct, unit: "%", color: "bg-red-50 text-red-600" },
                ].map(kpi => (
                    <Card key={kpi.label} className="rounded-2xl border border-gray-100 shadow-sm bg-white">
                        <CardContent className="pt-5 pb-4 px-5 flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {kpi.value}<span className="text-sm font-medium text-gray-400 ml-0.5">{kpi.unit}</span>
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
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${dept === d
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                            }`}>
                        {d}
                    </button>
                ))}
            </div>

            {/* Doctor Table */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900">
                        Doctor Workload — {dept}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {filtered.length} doctors shown
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                {["Doctor", "Specialization", "Department", "Patients", "Avg Consult", "Status"].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(doc => (
                                <tr key={doc.id}
                                    className={`transition-colors ${doc.status === "Overloaded" ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-gray-50"}`}>
                                    <td className="px-4 py-3 font-semibold text-gray-900">{doc.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{doc.specialization}</td>
                                    <td className="px-4 py-3 text-gray-500">{doc.department}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">{doc.currentPatients}</td>
                                    <td className="px-4 py-3 text-gray-600 tabular-nums">{doc.avgConsultTime} min</td>
                                    <td className="px-4 py-3">
                                        <Badge className={`text-xs border ${doc.status === "Normal" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                doc.status === "Overloaded" ? "bg-red-50 text-red-700 border-red-100" :
                                                    "bg-gray-100 text-gray-500 border-gray-200"
                                            }`}>
                                            {doc.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
