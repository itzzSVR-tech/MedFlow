"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, Shield, Database, Globe } from "lucide-react"

const settingSections = [
    {
        icon: Bell,
        color: "bg-blue-50 text-blue-600",
        title: "Notifications",
        description: "Configure surge alerts, staff overload warnings, and daily digest emails.",
        items: ["Surge Risk Alert Threshold", "Staff Overload Notification", "Daily OPD Digest", "ICU Capacity Warning Level"]
    },
    {
        icon: Shield,
        color: "bg-blue-50 text-blue-600",
        title: "Access Control",
        description: "Manage roles and permissions for dashboard modules.",
        items: ["Admin Role Permissions", "Viewer Role Permissions", "Two-Factor Authentication", "Session Timeout"]
    },
    {
        icon: Database,
        color: "bg-blue-50 text-blue-600",
        title: "Data & Integrations",
        description: "Configure API endpoints and data refresh intervals.",
        items: ["API Base URL (/api/admin)", "Data Refresh Interval", "Mock Data Mode", "Audit Logging"]
    },
    {
        icon: Globe,
        color: "bg-blue-50 text-blue-600",
        title: "System",
        description: "Regional settings, timezone, and display preferences.",
        items: ["Timezone (Asia/Kolkata)", "Date Format", "Language", "Dashboard Theme"]
    },
]

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">System configuration and preferences</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section) => (
                    <Card key={section.title} className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${section.color}`}>
                                    <section.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-semibold text-gray-900">{section.title}</CardTitle>
                                    <CardDescription className="text-xs">{section.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {section.items.map((item) => (
                                <div key={item} className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                                    <span className="text-xs text-gray-700 font-medium">{item}</span>
                                    <span className="text-xs text-blue-500 font-medium">Configure →</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                    <p className="text-sm font-medium text-gray-400">Settings editor backend integration coming soon</p>
                    <p className="text-xs text-gray-400 max-w-sm">All settings listed above are configurable. Full editor UI will be enabled once connected to the backend config API.</p>
                </CardContent>
            </Card>
        </div>
    )
}
