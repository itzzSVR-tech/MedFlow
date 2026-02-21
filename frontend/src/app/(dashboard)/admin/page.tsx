"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    medflowKpis,
    hourlyPatientData,
    bedOccupancyHeatmap,
    staffLoadData,
    surgeRiskLevel,
    surgeRiskLabel,
    surgeForecastMessage,
} from "@/constants/mock-data"
import {
    AreaChart, Area,
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

// Remap blue accent per card (some stay red/amber for medical urgency)
const kpiAccent: Record<string, string> = {
    opd: "#3b82f6",  // blue-500
    emergency: "#ef4444",  // red-500
    bed_occ: "#f59e0b",  // amber
    icu: "#ef4444",  // red
    wait: "#3b82f6",  // blue
    doctors: "#3b82f6",  // blue
}

function KpiCard({ kpi }: { kpi: typeof medflowKpis[0] }) {
    const color = kpiAccent[kpi.id] ?? "#3b82f6"
    const sparkData = kpi.sparkline.map((v, i) => ({ i, v }))

    const trendColor =
        kpi.trend === "up"
            ? kpi.id === "icu" || kpi.id === "emergency" ? "text-red-500" : "text-blue-500"
            : kpi.trend === "down" ? "text-green-600"
                : "text-gray-400"

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-150">
            <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {kpi.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <div className="flex items-end justify-between gap-2">
                    <div>
                        <div className="text-3xl font-bold text-gray-900 leading-none">
                            {kpi.value}
                            {kpi.unit && <span className="text-lg font-semibold text-gray-400 ml-0.5">{kpi.unit}</span>}
                        </div>
                        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trendColor}`}>
                            {kpi.trend === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
                            {kpi.trend === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
                            {kpi.trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
                            {kpi.trendValue} vs yesterday
                        </div>
                    </div>
                    <div className="h-12 w-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparkData}>
                                <defs>
                                    <linearGradient id={`sg-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
                                    fill={`url(#sg-${kpi.id})`} dot={false} isAnimationActive={false} animationDuration={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function HeatmapRow({ ward }: { ward: typeof bedOccupancyHeatmap[0] }) {
    const occPct = Math.round((ward.occupied / ward.total) * 100)
    const getColor = (pct: number) =>
        pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-blue-400"

    return (
        <div className="flex items-center gap-3">
            <span className="w-28 text-xs text-gray-600 font-medium truncate">{ward.ward}</span>
            <div className="flex-1 flex gap-0.5 h-5">
                {Array.from({ length: ward.total }).map((_, idx) => {
                    let color = "bg-gray-100"
                    if (idx < ward.occupied) color = getColor(occPct)
                    else if (idx < ward.occupied + ward.reserved) color = "bg-yellow-300"
                    else if (idx < ward.occupied + ward.reserved + ward.maintenance) color = "bg-gray-300"
                    return <div key={idx} className={`flex-1 rounded-sm ${color}`} />
                })}
            </div>
            <span className={`text-xs font-semibold w-10 text-right ${occPct >= 90 ? "text-red-600" : occPct >= 70 ? "text-amber-600" : "text-blue-600"
                }`}>{occPct}%</span>
        </div>
    )
}

function SurgeGauge({ risk }: { risk: number }) {
    const color = risk >= 70 ? "#ef4444" : risk >= 40 ? "#f59e0b" : "#22c55e"
    const labelColor = risk >= 70 ? "text-red-600" : risk >= 40 ? "text-amber-600" : "text-green-600"
    const bgColor = risk >= 70 ? "bg-red-50 border-red-100" : risk >= 40 ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="130" height="74" viewBox="0 0 130 74">
                <path d="M 10 65 A 55 55 0 0 1 120 65" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
                <path d="M 10 65 A 55 55 0 0 1 120 65" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(risk / 100) * 173} 173`} />
                <text x="65" y="62" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{risk}</text>
                <text x="65" y="76" textAnchor="middle" fontSize="9" fill="#9ca3af">/ 100</text>
            </svg>
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${bgColor} ${labelColor}`}>
                {surgeRiskLabel} Risk
            </span>
        </div>
    )
}

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Operations Overview</h2>
                <p className="text-sm text-gray-500 mt-0.5">Real-time hospital operations at a glance — Today, Feb 21</p>
            </div>

            {/* Row 1: 6 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medflowKpis.slice(0, 3).map((kpi: any) => (
                    <KpiCard key={kpi.id} kpi={kpi} />
                ))}
            </div>

            {/* Row 2: Hourly + Heatmap */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-900">Hourly Patient Check-ins</CardTitle>
                        <CardDescription className="text-xs text-gray-500">Today's patient visit timeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={hourlyPatientData}>
                                <defs>
                                    <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={2} />
                                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} />
                                <Line type="monotone" dataKey="checkins" stroke="#3b82f6" strokeWidth={2.5}
                                    dot={false} activeDot={{ r: 5, fill: "#3b82f6" }} name="Check-ins" isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-900">Bed Occupancy Heatmap</CardTitle>
                        <CardDescription className="text-xs text-gray-500">Ward-by-ward occupancy levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mt-1">
                            {bedOccupancyHeatmap.map((w) => <HeatmapRow key={w.ward} ward={w} />)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400 inline-block" /> &lt;70%</span>
                            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400 inline-block" /> 70–89%</span>
                            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-500 inline-block" /> ≥90%</span>
                            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-yellow-300 inline-block" /> Reserved</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Staff Load + Surge */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-900">Staff Load Distribution</CardTitle>
                        <CardDescription className="text-xs text-gray-500">Current patients per active doctor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={staffLoadData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "#6b7280" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} />
                                <Bar dataKey="patients" name="Patients" radius={[0, 4, 4, 0]} fill="#3b82f6" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-900">Surge Risk Monitor</CardTitle>
                        <CardDescription className="text-xs text-gray-500">AI-driven risk assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center gap-3 py-2">
                            <SurgeGauge risk={surgeRiskLevel} />
                            <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">{surgeForecastMessage}</p>
                            <div className="w-full space-y-2 mt-2">
                                {[
                                    { label: "OPD Load", value: 87, color: "bg-red-400" },
                                    { label: "ICU Fill Rate", value: 91, color: "bg-red-500" },
                                    { label: "ER Arrival Rate", value: 64, color: "bg-amber-400" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-28">{item.label}</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600 w-8 text-right">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
