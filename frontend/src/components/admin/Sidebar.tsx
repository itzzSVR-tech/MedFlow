"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BedDouble,
    Users,
    TrendingUp,
    AlertTriangle,
    FileBarChart2,
    Settings,
    Menu,
    Activity,
    LogOut,
    CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/role-context";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const adminNavigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Bed Management", href: "/admin/bed-management", icon: BedDouble },
    { name: "Staff Monitoring", href: "/admin/staff-monitoring", icon: Users },
    {
        name: "Patient Flow Analytics",
        href: "/admin/patient-flow",
        icon: TrendingUp,
    },
    {
        name: "Surge Prediction",
        href: "/admin/surge-prediction",
        icon: AlertTriangle,
    },
    { name: "Reports", href: "/admin/reports", icon: FileBarChart2 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

const doctorNavigation = [
    { name: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { name: "My Patients", href: "/doctor/patients", icon: Users },
    {
        name: "Consultations",
        href: "/doctor/consultations",
        icon: FileBarChart2,
    },
    { name: "Availability", href: "/doctor/availability", icon: TrendingUp },
    { name: "Profile", href: "/doctor/profile", icon: Settings },
];

const patientNavigation = [
    { name: "Dashboard", href: "/patient", icon: LayoutDashboard },
    { name: "Symptom Check", href: "/patient/symptoms", icon: Activity },
    { name: "Book Appointment", href: "/patient/book", icon: CalendarCheck },
    { name: "My Queue", href: "/patient/queue", icon: TrendingUp },
    { name: "Profile", href: "/patient/profile", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role } = useRole();
    const { user, profile, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigation =
        role === "doctor"
            ? doctorNavigation
            : role === "patient"
              ? patientNavigation
              : adminNavigation;

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/login");
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    const NavContent = () => (
        <nav className="flex flex-col gap-1 p-3">
            {navigation.map((item) => {
                const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                    >
                        <item.icon
                            className={cn(
                                "h-4 w-4 flex-shrink-0",
                                isActive ? "text-blue-500" : "text-gray-400",
                            )}
                        />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );

    const Logo = () => (
        <Link
            href="/"
            className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5 group hover:bg-gray-50 transition-colors"
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
                <span className="text-sm font-bold text-gray-900 leading-none">
                    MedFlow
                </span>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                    {role === "doctor"
                        ? "Doctor Portal"
                        : role === "patient"
                          ? "Patient Portal"
                          : "Admin Portal"}
                </p>
            </div>
        </Link>
    );

    const UserProfile = () => (
        <div className="flex items-center gap-3 p-2 rounded-2xl border border-gray-100 bg-gray-50/50 group hover:border-blue-100 hover:bg-white transition-all">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                    {(
                        profile?.full_name ||
                        user?.user_metadata?.full_name ||
                        "U"
                    )
                        .substring(0, 2)
                        .toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 overflow-hidden text-left">
                <p className="text-sm font-bold text-gray-900 truncate">
                    {profile?.full_name ||
                        user?.user_metadata?.full_name ||
                        "User"}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                    {user?.email}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                title="Sign Out"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                    asChild
                    className="lg:hidden fixed top-4 left-4 z-50"
                >
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl shadow-sm bg-white border-gray-200"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-white">
                    <div className="flex flex-col h-full">
                        <Logo />
                        <div className="flex-1 overflow-y-auto">
                            <NavContent />
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <UserProfile />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-white h-screen sticky top-0">
                <Logo />
                <div className="flex-1 overflow-y-auto py-2">
                    <NavContent />
                </div>

                <div className="p-4 space-y-4">
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                        <p className="text-xs font-semibold text-blue-600 font-outfit">
                            System Status
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-gray-500 font-inter">
                                All services operational
                            </span>
                        </div>
                    </div>

                    <UserProfile />
                </div>
            </aside>
        </>
    );
}
