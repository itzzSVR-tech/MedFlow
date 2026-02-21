"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BedDouble,
    Users,
    TrendingUp,
    AlertTriangle,
    FileBarChart2,
    Settings,
    Menu,
    Activity
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Bed Management", href: "/admin/bed-management", icon: BedDouble },
    { name: "Staff Monitoring", href: "/admin/staff-monitoring", icon: Users },
    { name: "Patient Flow Analytics", href: "/admin/patient-flow", icon: TrendingUp },
    { name: "Surge Prediction", href: "/admin/surge-prediction", icon: AlertTriangle },
    { name: "Reports", href: "/admin/reports", icon: FileBarChart2 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const NavContent = () => (
        <nav className="flex flex-col gap-1 p-3">
            {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )

    const Logo = () => (
        <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
                <span className="text-sm font-bold text-gray-900 leading-none">SmartCare Flow</span>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">Ops Dashboard</p>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <Logo />
                    <NavContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-white h-screen sticky top-0">
                <Logo />
                <div className="flex-1 overflow-y-auto py-2">
                    <NavContent />
                </div>
                <div className="border-t border-gray-100 p-4">
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                        <p className="text-xs font-semibold text-blue-600">System Status</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-gray-500">All services operational</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
