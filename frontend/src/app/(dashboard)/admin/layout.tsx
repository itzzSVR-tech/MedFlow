"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/admin/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, profile, signOut } = useAuth();
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
                        <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                            <h1 className="text-base font-bold text-gray-900 font-outfit">MedFlow</h1>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-500 font-inter">Hospital Operations Management</span>
                        </Link>

                        <div className="flex items-center gap-6">
                            {/* Live Indicator */}
                            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live System</span>
                            </div>

                            {/* Profile Section */}
                            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900 leading-none">
                                        {profile?.full_name || user?.user_metadata?.full_name || "Admin User"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter font-semibold">
                                        System Administrator
                                    </p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                                        {(profile?.full_name || user?.user_metadata?.full_name || "A").substring(0, 2).toUpperCase()}
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
