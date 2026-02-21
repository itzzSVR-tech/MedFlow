"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileBarChart2, Download, FileText, Table } from "lucide-react"

const reports = [
    {
        title: "Daily OPD Summary",
        description: "Outpatient visits, wait times, and department load",
        icon: FileText,
        color: "bg-blue-50 text-blue-600",
        updated: "Today, 08:00 AM"
    },
    {
        title: "Bed Utilization Report",
        description: "Ward-wise occupancy, turnover and maintenance logs",
        icon: Table,
        color: "bg-blue-50 text-blue-600",
        updated: "Today, 06:00 AM"
    },
    {
        title: "Staff Efficiency Report",
        description: "Consultation times, patient load and overload flags",
        icon: FileBarChart2,
        color: "bg-blue-50 text-blue-600",
        updated: "Yesterday, 11:59 PM"
    },
    {
        title: "Weekly Surge Analysis",
        description: "7-day OPD trend, fever correlation and risk forecasts",
        icon: FileBarChart2,
        color: "bg-amber-50 text-amber-600",
        updated: "Feb 17, 2026"
    },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Reports</h2>
                <p className="text-sm text-gray-500 mt-0.5">Download and manage operational reports</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {reports.map((r) => (
                    <Card key={r.title} className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-start gap-4">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.color}`}>
                                <r.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">{r.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                                <p className="text-[10px] text-gray-400 mt-2">Last updated: {r.updated}</p>
                            </div>
                            <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all flex-shrink-0">
                                <Download className="h-3.5 w-3.5" />
                                Export CSV
                            </button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <FileBarChart2 className="h-10 w-10 text-gray-200" />
                    <p className="text-sm font-medium text-gray-400">Advanced report builder coming soon</p>
                    <p className="text-xs text-gray-400 max-w-sm">Custom date ranges, department filters, and PDF export will be available in the next release.</p>
                </CardContent>
            </Card>
        </div>
    )
}
