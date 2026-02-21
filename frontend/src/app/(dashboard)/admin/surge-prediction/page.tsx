"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    surgeRiskLevel, surgeRiskLabel, surgeForecastMessage,
    opdTrendData,
} from "@/constants/mock-data"
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { ShieldCheck, TrendingUp, AlertCircle, Users, Clock } from "lucide-react"

function SurgeGauge({ risk }: { risk: number }) {
    const color = risk >= 70 ? "#ef4444" : risk >= 40 ? "#f59e0b" : "#22c55e"
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
                {surgeRiskLabel} Risk
            </span>
            <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">{surgeForecastMessage}</p>
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
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Surge Prediction</h2>
                <p className="text-sm text-gray-500 mt-0.5">AI-driven patient surge risk assessment and recommendations</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Gauge */}
                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-semibold text-gray-900">Current Surge Risk</CardTitle>
                        <CardDescription className="text-xs">Live AI risk score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SurgeGauge risk={surgeRiskLevel} />
                        <div className="flex justify-between text-xs text-gray-400 px-2">
                            <span className="text-green-600">Low (0–39)</span>
                            <span className="text-amber-600">Moderate (40–69)</span>
                            <span className="text-red-600">High (70+)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 14-day OPD Trend */}
                <Card className="rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-900">14-Day OPD Trend</CardTitle>
                        <CardDescription className="text-xs">Outpatient visits vs fever cases</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={opdTrendData}>
                                <defs>
                                    <linearGradient id="opdGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={1} />
                                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Line type="monotone" dataKey="opd" name="OPD" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="fever" name="Fever" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" /> AI Recommendations
                    </CardTitle>
                    <CardDescription className="text-xs">Actionable steps to mitigate surge risk</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {aiRecommendations.map(rec => (
                            <div key={rec.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${rec.color}`}>
                                    <rec.icon className="h-4 w-4" />
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{rec.title}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rec.body}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
