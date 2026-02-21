"use client"

import { UserButton } from "@clerk/nextjs"
import { Sidebar } from "@/components/admin/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import Link from "next/link"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
                        {/* ... existing header ... */}
                        <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                            <h1 className="text-base font-bold text-gray-900">MedFlow</h1>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-500">Hospital Operations Management</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {/* Live Indicator */}
                            <div className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-medium text-green-700">Live</span>
                            </div>
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
