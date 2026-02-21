"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockDoctors, type Doctor } from "@/constants/mock-data"
import { toast } from "sonner"
import { CheckCircle, XCircle, FileText } from "lucide-react"

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)

    const handleApprove = (doctorId: string) => {
        setDoctors(prev =>
            prev.map(doc =>
                doc.id === doctorId ? { ...doc, status: "Active" as const } : doc
            )
        )
        toast.success("Doctor approved successfully!", {
            description: "The doctor can now access the platform.",
        })
    }

    const handleReject = (doctorId: string) => {
        setDoctors(prev =>
            prev.map(doc =>
                doc.id === doctorId ? { ...doc, status: "Rejected" as const } : doc
            )
        )
        toast.error("Doctor application rejected", {
            description: "The doctor has been notified.",
        })
    }

    const pendingDoctors = doctors.filter(d => d.status === "Pending")
    const activeDoctors = doctors.filter(d => d.status === "Active")

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Doctor Management</h2>
                <p className="text-slate-500 mt-1">Manage doctor approvals and review applications</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="pending">
                        Pending Approvals ({pendingDoctors.length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        Active Doctors ({activeDoctors.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-6">
                    {pendingDoctors.length === 0 ? (
                        <Card className="border-slate-200">
                            <CardContent className="flex items-center justify-center py-16 text-slate-500">
                                <div className="text-center">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                    <p>No pending approvals</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingDoctors.map((doctor) => (
                            <Card key={doctor.id} className="border-slate-200">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                                                <AvatarFallback>{doctor.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                                <CardDescription>{doctor.email}</CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            Pending
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Specialization</p>
                                            <p className="text-sm text-slate-900">{doctor.specialization}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">License Number</p>
                                            <p className="text-sm text-slate-900">{doctor.licenseNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Applied Date</p>
                                            <p className="text-sm text-slate-900">
                                                {new Date(doctor.joinedDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Documents</p>
                                            <Button variant="link" className="p-0 h-auto text-indigo-600">
                                                <FileText className="h-4 w-4 mr-1" />
                                                View License
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleApprove(doctor.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(doctor.id)}
                                            variant="outline"
                                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="active" className="space-y-4 mt-6">
                    {activeDoctors.map((doctor) => (
                        <Card key={doctor.id} className="border-slate-200">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={doctor.avatar} alt={doctor.name} />
                                            <AvatarFallback>{doctor.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                            <CardDescription>{doctor.email}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                        Active
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Specialization</p>
                                        <p className="text-sm text-slate-900">{doctor.specialization}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">License</p>
                                        <p className="text-sm text-slate-900">{doctor.licenseNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Joined</p>
                                        <p className="text-sm text-slate-900">
                                            {new Date(doctor.joinedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}
