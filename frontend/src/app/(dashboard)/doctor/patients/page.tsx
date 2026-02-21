"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
    Search,
    Filter,
    MoreHorizontal,
    ClipboardList,
    ExternalLink,
    ChevronDown
} from "lucide-react"
import { mockDoctorPatients, TriageLevel } from "@/constants/doctor-mock-data"
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

export default function MyPatients() {
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const filteredPatients = mockDoctorPatients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
    )

    const getTriageColor = (triage: TriageLevel) => {
        switch (triage) {
            case "LOW": return "bg-green-50 text-green-700 border-green-100"
            case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-100"
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-100"
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200"
            default: return "bg-gray-50 text-gray-700 border-gray-100"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Waiting": return "bg-blue-50 text-blue-700"
            case "In Consultation": return "bg-purple-50 text-purple-700"
            case "Completed": return "bg-green-50 text-green-700"
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
                    <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-semibold">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Symptoms</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                                <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none">{patient.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{patient.id} • {patient.age}y</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={cn("text-[10px] px-2 py-0.5 border font-bold uppercase", getTriageColor(patient.triage))}>
                                            {patient.triage}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 line-clamp-1">{patient.symptoms}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className={cn("text-[10px] rounded-full px-3 py-0.5", getStatusColor(patient.status))}>
                                            {patient.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/doctor/consultations?id=${patient.id}`}>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold shadow-sm shadow-blue-200">
                                                    Consult
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100">
                                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-2">
                                                    <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer font-medium p-2.5">
                                                        <ClipboardList className="w-4 h-4" />
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
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900">No patients found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search query</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
