"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockBeds, type Bed } from "@/constants/mock-data"
import { BedDouble, X, User, CalendarDays, CalendarCheck, Stethoscope } from "lucide-react"

type BedTypeFilter = "All" | "ICU" | "General" | "Isolation"

const statusConfig = {
    Available: { bg: "bg-green-500", border: "border-green-200", label: "bg-green-50 text-green-700 border-green-200" },
    Occupied: { bg: "bg-red-500", border: "border-red-200", label: "bg-red-50 text-red-700 border-red-200" },
    Reserved: { bg: "bg-amber-400", border: "border-amber-200", label: "bg-amber-50 text-amber-700 border-amber-200" },
    Maintenance: { bg: "bg-gray-300", border: "border-gray-200", label: "bg-gray-100 text-gray-600 border-gray-200" },
}

export default function BedManagementPage() {
    const [filter, setFilter] = useState<BedTypeFilter>("All")
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

    const filtered = filter === "All" ? mockBeds : mockBeds.filter(b => b.type === filter)

    const summary = {
        total: mockBeds.length,
        available: mockBeds.filter(b => b.status === "Available").length,
        occupied: mockBeds.filter(b => b.status === "Occupied").length,
        reserved: mockBeds.filter(b => b.status === "Reserved").length,
        maintenance: mockBeds.filter(b => b.status === "Maintenance").length,
    }
    const occupiedPct = Math.round((summary.occupied / summary.total) * 100)
    const tabFilters: BedTypeFilter[] = ["All", "ICU", "General", "Isolation"]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Bed Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Real-time bed status across all wards</p>
            </div>

            {/* Summary */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="pt-5 pb-4 px-5">
                    <div className="flex flex-wrap items-center gap-6 mb-4">
                        {[
                            { label: "Total", value: summary.total, color: "text-gray-900" },
                            { label: "Available", value: summary.available, color: "text-green-600" },
                            { label: "Occupied", value: summary.occupied, color: "text-red-600" },
                            { label: "Reserved", value: summary.reserved, color: "text-amber-600" },
                            { label: "Maintenance", value: summary.maintenance, color: "text-gray-400" },
                        ].map(s => (
                            <div key={s.label}>
                                <p className="text-xs text-gray-400">{s.label}</p>
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                        <div className="ml-auto text-right">
                            <p className="text-xs text-gray-400">Overall Occupancy</p>
                            <p className={`text-2xl font-bold ${occupiedPct >= 90 ? "text-red-600" : occupiedPct >= 70 ? "text-amber-600" : "text-blue-600"}`}>
                                {occupiedPct}%
                            </p>
                        </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                        <div className="bg-red-500 h-full" style={{ width: `${(summary.occupied / summary.total) * 100}%` }} />
                        <div className="bg-amber-400 h-full" style={{ width: `${(summary.reserved / summary.total) * 100}%` }} />
                        <div className="bg-gray-300 h-full" style={{ width: `${(summary.maintenance / summary.total) * 100}%` }} />
                        <div className="bg-green-400 h-full flex-1" />
                    </div>
                </CardContent>
            </Card>

            {/* Type filters */}
            <div className="flex gap-2">
                {tabFilters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={[
                            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150",
                            filter === f
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                        ].join(" ")}
                    >
                        {f}
                        <span className="ml-1.5 text-xs opacity-70">
                            ({f === "All" ? mockBeds.length : mockBeds.filter(b => b.type === f).length})
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex gap-6">
                {/* Bed grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {filtered.map(bed => {
                            const cfg = statusConfig[bed.status]
                            const active = selectedBed?.id === bed.id
                            return (
                                <button
                                    key={bed.id}
                                    onClick={() => setSelectedBed(active ? null : bed)}
                                    className={[
                                        "relative rounded-xl border-2 p-2 text-center text-xs font-medium bg-white",
                                        "transition-[box-shadow,transform] duration-150 hover:scale-105 hover:shadow-md",
                                        cfg.border,
                                        active ? "ring-2 ring-blue-400 ring-offset-1" : "",
                                    ].join(" ")}
                                >
                                    <div className={`mx-auto mb-1 h-6 w-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                        <BedDouble className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="text-[10px] text-gray-700 font-semibold truncate">{bed.number}</div>
                                    <div className={[
                                        "text-[9px] mt-0.5 truncate",
                                        bed.status === "Available" ? "text-green-600"
                                            : bed.status === "Occupied" ? "text-red-500"
                                                : bed.status === "Reserved" ? "text-amber-600"
                                                    : "text-gray-400",
                                    ].join(" ")}>{bed.status}</div>
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-gray-500">
                        {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig["Available"]][]).map(([status, cfg]) => (
                            <span key={status} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-sm ${cfg.bg}`} />{status}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Side panel */}
                {selectedBed && (
                    <div className="w-72 flex-shrink-0">
                        <Card className="rounded-2xl border border-gray-100 shadow-sm sticky top-6">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-gray-900">{selectedBed.number}</CardTitle>
                                        <CardDescription className="text-xs">{selectedBed.ward} · {selectedBed.type}</CardDescription>
                                    </div>
                                    <button onClick={() => setSelectedBed(null)} className="text-gray-400 hover:text-gray-700 transition-colors duration-150">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <Badge className={`mt-1 w-fit text-xs ${statusConfig[selectedBed.status].label}`}>
                                    {selectedBed.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {selectedBed.patient && selectedBed.status !== "Maintenance" ? (
                                    <>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-400">Patient</p>
                                                <p className="font-semibold">{selectedBed.patient.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Stethoscope className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-400">Diagnosis</p>
                                                <p className="font-medium">{selectedBed.patient.diagnosis}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <CalendarDays className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-400">Admission Date</p>
                                                <p className="font-medium">{new Date(selectedBed.patient.admissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <CalendarCheck className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-400">Predicted Discharge</p>
                                                <p className="font-medium">
                                                    {selectedBed.patient.predictedDischarge !== "—"
                                                        ? new Date(selectedBed.patient.predictedDischarge).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">
                                        {selectedBed.status === "Maintenance" ? "This bed is currently under maintenance." : "No patient assigned."}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
