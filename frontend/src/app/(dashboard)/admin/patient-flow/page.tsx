"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    patientFlowData,
    hourlyPatientData,
} from "@/constants/mock-data"
import {
    AreaChart, Area,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function PatientFlowPage() {
    const totalAdmissions = patientFlowData.reduce((a, d) => a + d.admissions, 0)
    const totalDischarges = patientFlowData.reduce((a, d) => a + d.discharges, 0)
    const netCensus = totalAdmissions - totalDischarges

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Flow Analytics</h2>
                <p className="text-sm text-gray-500 mt-0.5">Admissions, discharges, and OPD volume trends</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    {
                        label: "Total Admissions", value: totalAdmissions, unit: "today",
                        icon: TrendingUp, color: "bg-blue-50 text-blue-600", textColor: "text-gray-900",
                    },
                    {
                        label: "Total Discharges", value: totalDischarges, unit: "today",
                        icon: TrendingDown, color: "bg-green-50 text-green-600", textColor: "text-gray-900",
                    },
                    {
                        label: "Net Census Change", value: netCensus, unit: "patients",
                        icon: Minus, color: netCensus > 0 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600", textColor: netCensus > 0 ? "text-amber-600" : "text-blue-600",
                    },
                ].map(kpi => (
                    <Card key={kpi.label} className="rounded-2xl border border-gray-100 shadow-sm bg-white">
                        <CardContent className="pt-5 pb-4 px-5 flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
                                <p className={`text-2xl font-bold ${kpi.textColor}`}>
                                    {kpi.value}
                                    <span className="text-sm font-medium text-gray-400 ml-1">{kpi.unit}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Area Chart: Admissions vs Discharges */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-900">Admissions vs Discharges</CardTitle>
                    <CardDescription className="text-xs">Hourly patient flow comparison</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={patientFlowData}>
                            <defs>
                                <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="disGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={1} />
                            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} />
                            <Legend wrapperStyle={{ fontSize: "11px" }} />
                            <Area type="monotone" dataKey="admissions" name="Admissions"
                                stroke="#3b82f6" strokeWidth={2.5} fill="url(#admGrad)" isAnimationActive={false} />
                            <Area type="monotone" dataKey="discharges" name="Discharges"
                                stroke="#22c55e" strokeWidth={2.5} fill="url(#disGrad)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bar Chart: OPD Hourly Volume */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-900">OPD Check-in Volume by Hour</CardTitle>
                    <CardDescription className="text-xs">Walk-in OPD patients per hour today</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={hourlyPatientData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={1} />
                            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} />
                            <Bar dataKey="checkins" name="Check-ins" radius={[4, 4, 0, 0]} fill="#3b82f6" isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
