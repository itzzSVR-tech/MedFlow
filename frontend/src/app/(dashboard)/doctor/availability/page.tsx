"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    CalendarCheck,
    Users,
    ChevronRight,
    Circle
} from "lucide-react"
import { useRole, AvailabilityStatus } from "@/contexts/role-context"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function AvailabilityPage() {
    const { availability, setAvailability } = useRole()

    const options: { status: AvailabilityStatus; label: string; desc: string; color: string; bg: string; icon: any }[] = [
        {
            status: "AVAILABLE",
            label: "Available for Consultations",
            desc: "You are active and ready to take new patients. Your name will appear at the top of the waiting list.",
            color: "text-green-600",
            bg: "bg-green-50",
            icon: CheckCircle2
        },
        {
            status: "BUSY",
            label: "In Consultation / Busy",
            desc: "You are currently occupied. You can still see your active patients but won't be assigned new ones automatically.",
            color: "text-orange-600",
            bg: "bg-orange-50",
            icon: Clock
        },
        {
            status: "OFF DUTY",
            label: "Off Duty / Break",
            desc: "You are currently not available. Use this for breaks, shift changes, or when leaving the hospital.",
            color: "text-gray-500",
            bg: "bg-gray-100",
            icon: AlertCircle
        }
    ]

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
                <p className="text-gray-500">Set your clinical status for the MedFlow system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((option) => (
                    <Card
                        key={option.status}
                        onClick={() => setAvailability(option.status)}
                        className={cn(
                            "relative overflow-hidden cursor-pointer transition-all border-2 rounded-[2rem] p-6 flex flex-col items-center text-center",
                            availability === option.status
                                ? "border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/10 scale-[1.02]"
                                : "border-gray-100 hover:border-blue-200 hover:bg-white"
                        )}
                    >
                        {availability === option.status && (
                            <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-1 text-white">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        )}

                        <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6", option.bg)}>
                            <option.icon className={cn("w-8 h-8", option.color)} />
                        </div>

                        <h3 className="font-bold text-gray-900 mb-2">{option.label}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed px-2">{option.desc}</p>

                        <div className="mt-8 pt-6 border-t border-gray-100 w-full flex items-center justify-center gap-2">
                            <Circle className={cn("w-2 h-2 fill-current", option.color)} />
                            <span className={cn("text-xs font-bold uppercase tracking-widest", option.color)}>
                                {option.status === availability ? "CURRENT STATUS" : "SELECT STATUS"}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm p-8 bg-white">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Current Shift Schedule</h3>
                        <p className="text-sm text-gray-500">Saturday, Feb 21 - Morning Shift</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Shift Time</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">08:00 AM - 04:00 PM</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Department</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">General Medicine</span>
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-end gap-3 text-xs text-gray-400 italic">
                <AlertCircle className="w-3.5 h-3.5" />
                Changing status will notify the nursing staff and triage units immediately.
            </div>
        </div>
    )
}
