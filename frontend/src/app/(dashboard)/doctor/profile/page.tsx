"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
    User, Mail, Briefcase, Edit3, Shield, Loader2,
    X, Save, CheckCircle, Stethoscope
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/api"
import { toast } from "sonner"

export default function DoctorProfilePage() {
    const { profile, loading } = useAuth()
    const [editOpen, setEditOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [doctorProfile, setDoctorProfile] = useState<any>(null)

    // Edit form state
    const [fullName, setFullName] = useState("")
    const [specialization, setSpecialization] = useState("")

    // Load full doctor profile from backend on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await api.get("/doctor/profile")
                setDoctorProfile(data)
            } catch {
                // Falls back to auth context profile
            }
        }
        if (profile) loadProfile()
    }, [profile])

    const openEdit = () => {
        setFullName(doctorProfile?.full_name || displayName)
        setSpecialization(doctorProfile?.doctors?.[0]?.specialization || "Medical Specialist")
        setEditOpen(true)
    }

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast.error("Name cannot be empty")
            return
        }
        try {
            setSaving(true)
            await api.patch("/doctor/profile", {
                full_name: fullName.trim(),
                specialization: specialization.trim() || undefined
            })
            // Optimistic local update
            setDoctorProfile((prev: any) => ({
                ...prev,
                full_name: fullName.trim(),
                doctors: [{ ...prev?.doctors?.[0], specialization: specialization.trim() }]
            }))
            toast.success("Profile updated successfully")
            setEditOpen(false)
        } catch (err: any) {
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    const displayName = doctorProfile?.full_name
        || profile?.email?.split("@")[0].split(".").map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ")
        || "Dr. Practitioner"
    const spec = doctorProfile?.doctors?.[0]?.specialization || "Medical Specialist"
    const joinedYear = new Date(doctorProfile?.created_at || profile?.created_at || Date.now()).getFullYear()
    const hospitalId = (doctorProfile?.hospital_id || profile?.hospital_id || "").split("-")[0].toUpperCase()

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500">Manage your professional information and credentials</p>
                </div>
                <Button onClick={openEdit} className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-lg shadow-blue-500/20">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Brief */}
                <Card className="p-8 rounded-[2rem] border-none shadow-sm flex flex-col items-center text-center bg-white h-fit">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-500/30">
                            {displayName.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full p-2 shadow-sm">
                            <Shield className="w-3 h-3 text-white fill-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-sm font-medium text-blue-600 mt-1">{spec}</p>
                    <div className="flex items-center gap-1.5 mt-4 py-1.5 px-4 bg-slate-50 rounded-full border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Verified Staff</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-slate-50">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Active</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{profile?.role?.toUpperCase()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Role</p>
                        </div>
                    </div>
                </Card>

                {/* Professional Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-blue-500" />
                            Professional Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Specialization</p>
                                <p className="text-sm font-bold text-slate-700">{spec}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Joined Since</p>
                                <p className="text-sm font-bold text-slate-700">{joinedYear}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hospital ID</p>
                                <p className="text-sm font-bold text-slate-700">{hospitalId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Availability</p>
                                <p className="text-sm font-bold text-slate-700 capitalize">{doctorProfile?.doctors?.[0]?.availability_status || "available"}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-500" />
                            Contact Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-slate-700">{doctorProfile?.email || profile?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal ID</p>
                                    <p className="text-sm font-bold text-slate-700 font-mono text-xs">{(doctorProfile?.id || profile?.id || "").substring(0, 8)}…</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setEditOpen(false) }}>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-8 pb-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <p className="text-sm text-gray-400 mt-1">Update your display name and specialization</p>
                            </div>
                            <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium"
                                        placeholder="Dr. Full Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Specialization</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={specialization}
                                        onChange={e => setSpecialization(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium"
                                        placeholder="e.g. Cardiology"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-2xl">
                                <p className="text-[11px] text-blue-600 font-medium">Email and hospital assignment can only be changed by your administrator.</p>
                            </div>
                        </div>

                        <div className="px-8 pb-8 flex gap-3">
                            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-2xl font-bold border-gray-200">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
