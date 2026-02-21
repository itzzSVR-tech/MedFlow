"use client"

import { Card } from "@/components/ui/card"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Award,
    Briefcase,
    GraduationCap,
    Edit3,
    Shield
} from "lucide-react"
import { mockDoctorProfile } from "@/constants/doctor-mock-data"
import { Button } from "@/components/ui/button"

export default function DoctorProfilePage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500">Manage your professional information and credentials</p>
                </div>
                <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Brief */}
                <Card className="p-8 rounded-[2rem] border-none shadow-sm flex flex-col items-center text-center bg-white h-fit">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-500/20">
                            {mockDoctorProfile.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full p-1.5 shadow-sm">
                            <Shield className="w-3 h-3 text-white fill-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{mockDoctorProfile.name}</h2>
                    <p className="text-sm font-medium text-blue-600 mt-1">{mockDoctorProfile.specialization}</p>
                    <div className="flex items-center gap-1.5 mt-3 py-1 px-3 bg-gray-50 rounded-full border border-gray-100">
                        <span className="text-xs font-bold text-gray-500">{mockDoctorProfile.department}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-gray-50">
                        <div>
                            <p className="text-sm font-bold text-gray-900">{mockDoctorProfile.patients}+</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patients</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{mockDoctorProfile.rating}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                        </div>
                    </div>
                </Card>

                {/* Professional Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-gray-400" />
                            Professional Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</p>
                                <p className="text-sm font-semibold text-gray-700">{mockDoctorProfile.specialization}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                                <p className="text-sm font-semibold text-gray-700">{mockDoctorProfile.experience}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Since</p>
                                <p className="text-sm font-semibold text-gray-700">{mockDoctorProfile.joinedYear}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qualification</p>
                                <p className="text-sm font-semibold text-gray-700">{mockDoctorProfile.qualification}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            Contact Details
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-700">{mockDoctorProfile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Contact</p>
                                    <p className="text-sm font-semibold text-gray-700">{mockDoctorProfile.contact}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
