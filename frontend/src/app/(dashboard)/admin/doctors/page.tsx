"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Users, UserPlus, Loader2, RefreshCw, Search, CheckCircle, XCircle, Clock
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRealtime } from "@/hooks/use-realtime"

interface Doctor {
    id: string
    availability_status: string
    specialization: string
    users: {
        full_name: string
        email: string
        status: string
    }
}

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
    available: { label: "Active", color: "bg-green-50 text-green-700", dot: "bg-green-500" },
    busy: { label: "Busy", color: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
    "off duty": { label: "Offline", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
}

// ── Add Doctor Modal ──────────────────────────────────────────────────────────
function AddDoctorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        specialization: "",
        temporary_password: "",
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.full_name.trim()) e.full_name = "Full name is required"
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required"
        if (!form.specialization.trim()) e.specialization = "Specialization is required"
        if (!form.temporary_password || form.temporary_password.length < 8) e.temporary_password = "Password must be at least 8 characters"
        return e
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        try {
            setLoading(true)
            await api.post("/admin/doctors", form)
            toast.success(`Dr. ${form.full_name} added successfully! They can log in with the temporary password.`)
            onSuccess()
            onClose()
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message
            toast.error(`Failed to add doctor: ${msg}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Doctor</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Creates a Supabase account + doctor profile</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { key: "full_name", label: "Full Name", type: "text", placeholder: "Dr. Jane Smith" },
                        { key: "email", label: "Email Address", type: "email", placeholder: "dr.jane@hospital.com" },
                        { key: "specialization", label: "Specialization", type: "text", placeholder: "Cardiology, General Practice…" },
                        { key: "temporary_password", label: "Temporary Password", type: "password", placeholder: "Min. 8 characters" },
                    ].map(({ key, label, type, placeholder }) => (
                        <div key={key}>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                            <input
                                type={type}
                                placeholder={placeholder}
                                value={(form as any)[key]}
                                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                                    errors[key] ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-blue-500"
                                )}
                            />
                            {errors[key] && <p className="text-xs text-red-500 mt-1 font-medium">{errors[key]}</p>}
                        </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl border-gray-200 font-bold">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            {loading ? "Creating…" : "Add Doctor"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorsPage() {
    const { profile } = useAuth()
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await api.get("/admin/doctors")
            setDoctors(data.data ?? data)
        } catch (err: any) {
            toast.error("Failed to load doctors")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDoctors()
    }, [fetchDoctors])

    const doctorEvent = useRealtime(profile?.hospital_id || "", "doctors")
    useEffect(() => {
        if (doctorEvent?.type === 'DOCTOR_STATUS_CHANGED' || doctorEvent?.type === 'DOCTOR_CREATED') {
            fetchDoctors()
        }
    }, [doctorEvent, fetchDoctors])

    const handleStatusChange = async (doctorId: string, status: string) => {
        try {
            setUpdatingId(doctorId)
            await api.patch(`/admin/doctors/${doctorId}/status`, { status })
            setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, availability_status: status } : d))
            toast.success("Doctor status updated")
        } catch (err: any) {
            toast.error("Failed to update status")
        } finally {
            setUpdatingId(null)
        }
    }

    const filtered = doctors.filter(d =>
        (d.users?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
    )

    const byStatus = (status: string) => filtered.filter(d => d.availability_status === status)

    const DoctorCard = ({ doc }: { doc: Doctor }) => {
        const s = STATUS_MAP[doc.availability_status] || STATUS_MAP["off duty"]
        return (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                        {(doc.users?.full_name || "D").charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-none">{doc.users?.full_name || "Unknown"}</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-wider">{doc.specialization}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold border-none", s.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", s.dot)} />
                        {s.label}
                    </Badge>
                    <select
                        className="text-xs rounded-xl border border-gray-200 px-2 py-1.5 bg-white focus:border-blue-500 outline-none font-medium"
                        value={doc.availability_status}
                        disabled={updatingId === doc.id}
                        onChange={e => handleStatusChange(doc.id, e.target.value)}
                    >
                        <option value="available">Set Active</option>
                        <option value="busy">Set Busy</option>
                        <option value="off duty">Set Offline</option>
                    </select>
                    {updatingId === doc.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
                </div>
            </div>
        )
    }

    return (
        <>
            {showModal && (
                <AddDoctorModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchDoctors}
                />
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
                        <p className="text-sm text-gray-500">{doctors.length} registered · {byStatus("available").length} active now</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search doctors…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none w-56 text-sm"
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchDoctors} className="rounded-xl border-gray-200 h-10 w-10">
                            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        </Button>
                        <Button
                            onClick={() => setShowModal(true)}
                            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100 px-5"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Doctor
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <Tabs defaultValue="available">
                        <TabsList className="rounded-2xl bg-gray-100 p-1 mb-4">
                            <TabsTrigger value="available" className="rounded-xl font-bold text-sm px-4">
                                Active <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">{byStatus("available").length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="busy" className="rounded-xl font-bold text-sm px-4">
                                Busy <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">{byStatus("busy").length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="off duty" className="rounded-xl font-bold text-sm px-4">
                                Offline <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">{byStatus("off duty").length}</span>
                            </TabsTrigger>
                        </TabsList>

                        {["available", "busy", "off duty"].map(status => (
                            <TabsContent key={status} value={status}>
                                <Card className="rounded-3xl border-none shadow-sm">
                                    <div className="p-6 space-y-3">
                                        {byStatus(status).length === 0 ? (
                                            <div className="text-center py-16">
                                                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                                <p className="text-sm text-gray-400 font-bold">No doctors in this category</p>
                                            </div>
                                        ) : (
                                            byStatus(status).map(doc => <DoctorCard key={doc.id} doc={doc} />)
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </>
    )
}
