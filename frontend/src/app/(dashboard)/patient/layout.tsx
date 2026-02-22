"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/admin/Sidebar";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Bell, Search } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, signOut, user } = useAuth();

    return (
        <ProtectedRoute allowedRoles={["patient"]}>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative w-full max-w-md hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for doctors, records, or help..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                            {/* Profile Section */}
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900 leading-none">
                                        {profile?.full_name || "Patient User"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter font-semibold">
                                        Patient Account
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="focus:outline-none">
                                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100 hover:ring-blue-200 transition-all">
                                                <AvatarImage
                                                    src={
                                                        user?.user_metadata
                                                            ?.avatar_url
                                                    }
                                                />
                                                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                                                    {(profile?.full_name || "P")
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56 mt-2 rounded-2xl p-2 border-gray-100 shadow-xl"
                                    >
                                        <DropdownMenuItem className="rounded-xl p-3 cursor-pointer font-medium hover:bg-blue-50 hover:text-blue-600">
                                            My Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl p-3 cursor-pointer font-medium hover:bg-blue-50 hover:text-blue-600">
                                            Medical Records
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl p-3 cursor-pointer font-medium hover:bg-blue-50 hover:text-blue-600">
                                            Settings
                                        </DropdownMenuItem>
                                        <div className="h-px bg-gray-100 my-2"></div>
                                        <DropdownMenuItem
                                            onClick={signOut}
                                            className="rounded-xl p-3 cursor-pointer font-bold text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
