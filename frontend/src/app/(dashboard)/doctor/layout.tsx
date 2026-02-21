"use client"

import { useRole, AvailabilityStatus } from "@/contexts/role-context"
import { UserButton } from "@clerk/nextjs"
import { Sidebar } from "@/components/admin/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { availability, setAvailability } = useRole()

    const getStatusColor = (status: AvailabilityStatus) => {
        switch (status) {
            case "AVAILABLE": return "text-green-500 fill-green-500"
            case "BUSY": return "text-orange-500 fill-orange-500"
            case "OFF DUTY": return "text-gray-400 fill-gray-400"
        }
    }

    return (
        <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">MedFlow Doctor</Link>
                            <span className="text-gray-300">|</span>
                            {/* Availability Toggle */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                                        <Circle className={cn("w-2.5 h-2.5", getStatusColor(availability))} />
                                        <span className="text-sm font-bold text-gray-700">{availability}</span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-2xl border-gray-100 shadow-xl p-2 w-48">
                                    <DropdownMenuItem onClick={() => setAvailability("AVAILABLE")} className="rounded-xl gap-3 p-3 cursor-pointer font-bold text-green-700 hover:bg-green-50">
                                        <Circle className="w-2.5 h-2.5 fill-green-500" />
                                        AVAILABLE
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAvailability("BUSY")} className="rounded-xl gap-3 p-3 cursor-pointer font-bold text-orange-700 hover:bg-orange-50">
                                        <Circle className="w-2.5 h-2.5 fill-orange-500" />
                                        BUSY
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAvailability("OFF DUTY")} className="rounded-xl gap-3 p-3 cursor-pointer font-bold text-gray-600 hover:bg-gray-50">
                                        <Circle className="w-2.5 h-2.5 fill-gray-400" />
                                        OFF DUTY
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
