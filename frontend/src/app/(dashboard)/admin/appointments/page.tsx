"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockAppointments } from "@/constants/mock-data"
import { Calendar, Clock, User } from "lucide-react"

export default function AppointmentsPage() {
    const getStatusBadge = (status: string) => {
        const colors = {
            Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
            Completed: "bg-green-100 text-green-700 border-green-200",
            Cancelled: "bg-red-100 text-red-700 border-red-200",
        }
        return colors[status as keyof typeof colors] || "bg-slate-100 text-slate-700"
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
                <p className="text-slate-500 mt-1">View all scheduled and completed appointments</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-slate-500">Scheduled</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">
                            {mockAppointments.filter(a => a.status === "Scheduled").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-slate-500">Completed</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {mockAppointments.filter(a => a.status === "Completed").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-slate-500">Cancelled</CardDescription>
                        <CardTitle className="text-3xl text-red-600">
                            {mockAppointments.filter(a => a.status === "Cancelled").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Appointments Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {mockAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-slate-200">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{appointment.type}</CardTitle>
                                <Badge className={getStatusBadge(appointment.status)}>
                                    {appointment.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{appointment.patientName}</p>
                                        <p className="text-slate-500">Patient</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">{appointment.doctorName}</p>
                                        <p className="text-slate-500">Doctor</p>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(appointment.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock className="h-4 w-4" />
                                        {appointment.time}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
