"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRole, AvailabilityStatus } from "@/contexts/role-context"
import { Sidebar } from "@/components/admin/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
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
    const { profile, signOut } = useAuth()
    const { availability, setAvailability } = useRole()

    const getStatusColor = (status: AvailabilityStatus) => {
        switch (status) {
            case "AVAILABLE": return "text-green-500 fill-green-500"
            case "BUSY": return "text-orange-500 fill-orange-500"
            case "OFF DUTY": return "text-gray-400 fill-gray-400"
        }
    }

    return (
        <ProtectedRoute allowedRoles={["doctor"]}>
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
                        <div className="flex items-center gap-6">
                            {/* Profile Section */}
                            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900 leading-none">
                                        {profile?.full_name || "Doctor User"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter font-semibold">
                                        Medical Staff
                                    </p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                    <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                                        {(profile?.full_name || "D").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={signOut}
                                    title="Sign Out"
                                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
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
