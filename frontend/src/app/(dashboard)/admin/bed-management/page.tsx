"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BedDouble, X, User, CalendarDays, CalendarCheck, Stethoscope, Loader2, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Bed {
    id: string;
    bed_number: string;
    ward: string;
    type: "ICU" | "General" | "Isolation";
    status: "Available" | "Occupied" | "Reserved" | "Maintenance";
    created_at: string;
}

type BedTypeFilter = "All" | "ICU" | "General" | "Isolation"

const statusConfig = {
    Available: { bg: "bg-green-500", border: "border-green-200", label: "bg-green-50 text-green-700 border-green-200" },
    Occupied: { bg: "bg-red-500", border: "border-red-200", label: "bg-red-50 text-red-700 border-red-200" },
    Reserved: { bg: "bg-amber-400", border: "border-amber-200", label: "bg-amber-50 text-amber-700 border-amber-200" },
    Maintenance: { bg: "bg-gray-300", border: "border-gray-200", label: "bg-gray-100 text-gray-600 border-gray-200" },
}

export default function BedManagementPage() {
    const [beds, setBeds] = useState<Bed[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<BedTypeFilter>("All")
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

    const fetchBeds = async () => {
        try {
            setLoading(true)
            const { data } = await api.get("/admin/beds")
            setBeds(data.data ?? data ?? [])
        } catch (err) {
            console.error("Failed to fetch beds:", err)
            toast.error("Failed to load beds")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBeds()
    }, [])

    const filtered = beds.filter(b => filter === "All" || b.type === filter)

    const summary = useMemo(() => ({
        total: beds.length,
        available: beds.filter(b => b.status === "Available").length,
        occupied: beds.filter(b => b.status === "Occupied").length,
        reserved: beds.filter(b => b.status === "Reserved").length,
        maintenance: beds.filter(b => b.status === "Maintenance").length,
    }), [beds])

    const updateStatus = async (bedId: string, newStatus: string) => {
        try {
            await api.patch(`/admin/beds/${bedId}`, { status: newStatus })
            setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: newStatus as any } : b))
            if (selectedBed?.id === bedId) setSelectedBed(prev => prev ? { ...prev, status: newStatus as any } : null)
            toast.success("Bed status updated")
        } catch (err) {
            toast.error("Failed to update bed status")
        }
    }

    const occupiedPct = summary.total > 0 ? Math.round((summary.occupied / summary.total) * 100) : 0
    const tabFilters: BedTypeFilter[] = ["All", "ICU", "General", "Isolation"]

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
                    <h2 className="text-xl font-bold text-gray-900">Bed Management</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Real-time bed status across all wards</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchBeds} className="rounded-xl flex gap-2 font-bold">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
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
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                        <div className="ml-auto text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Occupancy</p>
                            <p className={`text-2xl font-bold ${occupiedPct >= 90 ? "text-red-600" : occupiedPct >= 70 ? "text-amber-600" : "text-blue-600"}`}>
                                {occupiedPct}%
                            </p>
                        </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                        <div className="bg-red-500 h-full" style={{ width: `${summary.total > 0 ? (summary.occupied / summary.total) * 100 : 0}%` }} />
                        <div className="bg-amber-400 h-full" style={{ width: `${summary.total > 0 ? (summary.reserved / summary.total) * 100 : 0}%` }} />
                        <div className="bg-gray-300 h-full" style={{ width: `${summary.total > 0 ? (summary.maintenance / summary.total) * 100 : 0}%` }} />
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
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold border transition-colors duration-150 uppercase tracking-wider text-[10px]",
                            filter === f
                                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                        )}
                    >
                        {f}
                        <span className="ml-1.5 opacity-70">
                            ({f === "All" ? beds.length : beds.filter(b => b.type === f).length})
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex gap-6">
                {/* Bed grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {filtered.map(bed => {
                            const cfg = statusConfig[bed.status] || statusConfig.Available
                            const active = selectedBed?.id === bed.id
                            return (
                                <button
                                    key={bed.id}
                                    onClick={() => setSelectedBed(active ? null : bed)}
                                    className={cn(
                                        "relative rounded-xl border-2 p-2 text-center text-xs font-medium bg-white",
                                        "transition-[box-shadow,transform] duration-150 hover:scale-105 hover:shadow-md",
                                        cfg.border,
                                        active ? "ring-2 ring-blue-400 ring-offset-1" : "",
                                    )}
                                >
                                    <div className={`mx-auto mb-1 h-6 w-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                        <BedDouble className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="text-[10px] text-gray-700 font-bold truncate">{bed.bed_number}</div>
                                    <div className={cn(
                                        "text-[9px] mt-0.5 truncate font-bold uppercase",
                                        bed.status === "Available" ? "text-green-600"
                                            : bed.status === "Occupied" ? "text-red-500"
                                                : bed.status === "Reserved" ? "text-amber-600"
                                                    : "text-gray-400",
                                    )}>{bed.status}</div>
                                </button>
                            )
                        })}
                    </div>
                    {filtered.length === 0 && (
                        <div className="py-20 text-center text-gray-400 border-2 border-dashed rounded-3xl">
                            <p className="font-bold">No beds found for this category.</p>
                        </div>
                    )}
                    <div className="flex gap-4 mt-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig["Available"]][]).map(([status, cfg]) => (
                            <span key={status} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-sm ${cfg.bg}`} />{status}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Side panel */}
                {selectedBed && (
                    <div className="w-72 flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card className="rounded-[2rem] border-none shadow-xl sticky top-6 bg-white overflow-hidden">
                            <CardHeader className="pb-3 bg-slate-50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-900">{selectedBed.bed_number}</CardTitle>
                                        <CardDescription className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedBed.ward} · {selectedBed.type}</CardDescription>
                                    </div>
                                    <button onClick={() => setSelectedBed(null)} className="p-1 hover:bg-white rounded-full transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <Badge className={cn("mt-2 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider", statusConfig[selectedBed.status]?.label)}>
                                    {selectedBed.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(statusConfig).map(s => (
                                            <Button
                                                key={s}
                                                variant={selectedBed.status === s ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => updateStatus(selectedBed.id, s)}
                                                className="text-[10px] font-bold h-8 rounded-lg"
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 italic text-xs text-slate-400">
                                    Patient logic for individual beds is managed via the Appointments and Triage modules.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
