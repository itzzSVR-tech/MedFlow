"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import {
    Clock,
    AlertCircle,
    CheckCircle2,
    CalendarCheck,
    Users,
    Circle,
    Loader2
} from "lucide-react"
import { useRole, AvailabilityStatus } from "@/contexts/role-context"
import { cn } from "@/lib/utils"

export default function AvailabilityPage() {
    const { availability, setAvailability } = useRole()
    const [saving, setSaving] = useState<AvailabilityStatus | null>(null)

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

    const handleSelect = async (status: AvailabilityStatus) => {
        if (status === availability || saving) return
        setSaving(status)
        try {
            await setAvailability(status)
        } finally {
            setSaving(null)
        }
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
                <p className="text-gray-500">Set your clinical status — updates are saved to the system immediately</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((option) => {
                    const isActive = availability === option.status
                    const isSaving = saving === option.status
                    return (
                        <Card
                            key={option.status}
                            onClick={() => handleSelect(option.status)}
                            className={cn(
                                "relative overflow-hidden cursor-pointer transition-all border-2 rounded-[2rem] p-6 flex flex-col items-center text-center select-none",
                                isActive
                                    ? "border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/10 scale-[1.02]"
                                    : "border-gray-100 hover:border-blue-200 hover:bg-white",
                                (saving && !isSaving) ? "opacity-50 pointer-events-none" : ""
                            )}
                        >
                            {isActive && !isSaving && (
                                <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-1 text-white">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                            {isSaving && (
                                <div className="absolute top-4 right-4 bg-blue-100 rounded-full p-1 text-blue-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
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
                                    {isSaving ? "SAVING..." : isActive ? "CURRENT STATUS" : "SELECT STATUS"}
                                </span>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm p-8 bg-white">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">How Status Works</h3>
                        <p className="text-sm text-gray-500">Changes are synced to the nursing station and triage unit in real time</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", title: "Available", desc: "New patients assigned automatically" },
                        { icon: Clock, color: "text-orange-600", bg: "bg-orange-50", title: "Busy", desc: "See current patients, no new assignments" },
                        { icon: Users, color: "text-gray-500", bg: "bg-gray-100", title: "Off Duty", desc: "Removed from active queue entirely" },
                    ].map(item => (
                        <div key={item.title} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", item.bg)}>
                                <item.icon className={cn("w-5 h-5", item.color)} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                <p className="text-[10px] text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="flex items-center justify-end gap-3 text-xs text-gray-400 italic">
                <AlertCircle className="w-3.5 h-3.5" />
                Changing status will notify the nursing staff and triage units immediately.
            </div>
        </div>
    )
}
