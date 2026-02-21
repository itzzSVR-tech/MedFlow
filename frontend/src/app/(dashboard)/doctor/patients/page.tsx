"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
    Search,
    Filter,
    MoreHorizontal,
    ClipboardList,
    ExternalLink,
    Loader2,
    RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "sonner"

interface Appointment {
    id: string;
    patient_name?: string;
    status: string;
    scheduled_at: string;
    triage?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    symptoms?: string;
}

export default function MyPatients() {
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [appointments, setAppointments] = useState<Appointment[]>([])

    const fetchPatients = async () => {
        try {
            setIsLoading(true)
            const { data } = await api.get("/doctor/appointments")
            // Backend returns { appointments, weeklyStats }
            setAppointments(data.appointments || [])
        } catch (err) {
            console.error("Failed to fetch patients:", err)
            toast.error("Failed to load patient list")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPatients()
    }, [])

    const filteredPatients = appointments.filter(p =>
        (p.patient_name || "Patient").toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
    )

    const getTriageColor = (triage?: string) => {
        switch (triage?.toUpperCase()) {
            case "LOW": return "bg-green-50 text-green-700 border-green-100"
            case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-100"
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-100"
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200"
            default: return "bg-gray-50 text-gray-700 border-gray-100"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "scheduled": return "bg-blue-50 text-blue-700"
            case "completed": return "bg-green-50 text-green-700"
            case "cancelled": return "bg-red-50 text-red-700"
            default: return "bg-gray-50 text-gray-700"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
                    <p className="text-gray-500">Manage your active patient list and consultations</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none w-64 text-sm transition-all"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchPatients} className="rounded-xl border-gray-200 font-semibold h-10 w-10">
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Symptoms</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-32 bg-gray-100 rounded-lg" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-100 rounded-lg" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-100 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                                                {(patient.patient_name || "P").charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none">{patient.patient_name || "Patient"}</p>
                                                <p className="text-[10px] text-gray-500 mt-1.5 font-bold uppercase tracking-wider">{new Date(patient.scheduled_at).toLocaleDateString()} • {new Date(patient.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={cn("text-[9px] px-2.5 py-1 border-none rounded-full font-bold uppercase tracking-wider", getTriageColor(patient.triage))}>
                                            {patient.triage || "LOW"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-600 line-clamp-1">{patient.symptoms || "Regular checkup"}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className={cn("text-[10px] rounded-full px-3 py-1 font-bold uppercase tracking-wider", getStatusColor(patient.status))}>
                                            {patient.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/doctor/consultations?id=${patient.id}`}>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold shadow-sm h-8">
                                                    Consult
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 bg-white ring-1 ring-slate-100">
                                                    <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer font-bold text-xs p-3 focus:bg-slate-50">
                                                        <ClipboardList className="w-4 h-4 text-blue-500" />
                                                        View Records
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!isLoading && filteredPatients.length === 0 && (
                    <div className="p-20 text-center bg-slate-50/50">
                        <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-gray-200" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">No patients found</h3>
                        <p className="text-gray-500 text-sm mt-1 mb-8">No active appointments matching your criteria.</p>
                        <Button onClick={fetchPatients} variant="outline" className="rounded-xl font-bold border-gray-200">
                            Clear Search & Refresh
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}
