"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { ShieldCheck, TrendingUp, AlertCircle, Users, Clock, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

function SurgeGauge({ risk }: { risk: number }) {
    const color = risk >= 70 ? "#ef4444" : risk >= 40 ? "#f59e0b" : "#22c55e"
    const label = risk >= 70 ? "CRITICAL" : risk >= 40 ? "MODERATE" : "STABLE"
    const labelBg = risk >= 70 ? "bg-red-50 text-red-700 border-red-200" : risk >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"

    return (
        <div className="flex flex-col items-center gap-3 py-4">
            <svg width="160" height="90" viewBox="0 0 160 90">
                <path d="M 14 78 A 66 66 0 0 1 146 78" fill="none" stroke="#f3f4f6" strokeWidth="12" strokeLinecap="round" />
                <path d="M 14 78 A 66 66 0 0 1 146 78" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(risk / 100) * 207} 207`} />
                <text x="80" y="70" textAnchor="middle" fontSize="26" fontWeight="700" fill="#111827">{risk}</text>
                <text x="80" y="86" textAnchor="middle" fontSize="11" fill="#9ca3af">/ 100</text>
            </svg>
            <span className={`text-xs font-bold px-4 py-1 rounded-full border ${labelBg}`}>
                {label} Risk
            </span>
            <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">
                {risk >= 70 ? "Incoming surge expected within 2 hours. High triage load detected." : "Normal operational flow. Bed occupancy within safety margins."}
            </p>
        </div>
    )
}

const aiRecommendations = [
    { icon: Users, color: "bg-blue-50 text-blue-600", title: "Staff Up", body: "Add 3 doctors to Emergency department for the next 4 hours." },
    { icon: TrendingUp, color: "bg-amber-50 text-amber-600", title: "Pre-allocate Beds", body: "Reserve 8 General ward beds for anticipated OPD conversions." },
    { icon: AlertCircle, color: "bg-red-50 text-red-600", title: "ICU Alert", body: "ICU at 91% — arrange step-down unit transfers for 2 patients." },
    { icon: Clock, color: "bg-blue-50 text-blue-600", title: "Stagger Shifts", body: "Stagger nursing shift handover by 30 min to reduce coverage gap." },
]

export default function SurgePredictionPage() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get("/admin/analytics")
                setAnalytics(data.data ?? data)
            } catch (err) {
                toast.error("Failed to load surge trends")
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

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
                <h2 className="text-xl font-bold text-gray-900">Surge Prediction</h2>
                <p className="text-sm text-gray-500 mt-0.5">AI-driven patient surge risk assessment and recommendations</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-bold text-gray-900">Current Surge Risk</CardTitle>
                        <CardDescription className="text-xs font-medium">Live AI risk score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SurgeGauge risk={analytics?.surgeRisk || 0} />
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider px-2">
                            <span className="text-green-600">Low (0–39)</span>
                            <span className="text-amber-600">Moderate (40–69)</span>
                            <span className="text-red-600">High (70+)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm lg:col-span-2 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-900 font-display">14-Day Admission Trend</CardTitle>
                        <CardDescription className="text-xs font-medium">Outpatient visits vs critical conversions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics?.dailyTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                                    <Line type="monotone" dataKey="opd" name="OPD Inflow" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="fever" name="Fever Cases" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white">
                <CardHeader className="pb-3 px-8 pt-8">
                    <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-500" /> AI Recommendations
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">Actionable steps to mitigate surge risk</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {aiRecommendations.map(rec => (
                            <div key={rec.title} className="rounded-2xl border border-slate-50 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${rec.color}`}>
                                    <rec.icon className="h-5 w-5" />
                                </div>
                                <p className="font-bold text-slate-900 text-sm">{rec.title}</p>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{rec.body}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
