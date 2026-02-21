"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import {
    Loader2, Save, CheckCircle, ArrowLeft, FileText,
    Pill, Stethoscope, StickyNote, CalendarCheck, ClipboardList, ChevronRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ─── No-appointment landing state ────────────────────────────────────────────
function SelectPatientState({ appointments, loading }: {
    appointments: any[]
    loading: boolean
}) {
    const scheduled = appointments.filter(a => a.status === "scheduled")

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
                <p className="text-gray-500">Select an active appointment to begin a consultation</p>
            </div>

            {scheduled.length === 0 ? (
                <Card className="p-16 rounded-3xl border-none shadow-sm flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center">
                        <ClipboardList className="w-9 h-9 text-blue-300" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">No active appointments</h3>
                    <p className="text-sm text-gray-400">You have no scheduled appointments to consult right now.</p>
                    <Link href="/doctor/patients">
                        <Button variant="outline" className="rounded-2xl font-bold border-gray-200 mt-2">
                            View All Patients
                        </Button>
                    </Link>
                </Card>
            ) : (
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{scheduled.length} Pending Appointment{scheduled.length > 1 ? "s" : ""}</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {scheduled.map(appt => (
                            <Link key={appt.id} href={`/doctor/consultations?id=${appt.id}`}>
                                <div className="px-6 py-4 hover:bg-blue-50/30 transition-colors flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                                            {(appt.patient_name || "P").charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{appt.patient_name || "Unknown Patient"}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{appt.symptoms || "No symptoms recorded"} · {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {appt.triage && (
                                            <Badge className={cn("text-[9px] font-bold px-2.5 py-1 border-none rounded-full uppercase",
                                                appt.triage === "CRITICAL" ? "bg-red-50 text-red-700" :
                                                    appt.triage === "HIGH" ? "bg-orange-50 text-orange-700" :
                                                        appt.triage === "MEDIUM" ? "bg-yellow-50 text-yellow-700" :
                                                            "bg-green-50 text-green-700"
                                            )}>
                                                {appt.triage}
                                            </Badge>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ConsultationPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const appointmentId = searchParams.get("id")

    const [allAppointments, setAllAppointments] = useState<any[]>([])
    const [appointment, setAppointment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingDraft, setSavingDraft] = useState(false)
    const [completed, setCompleted] = useState(false)

    const [diagnosis, setDiagnosis] = useState("")
    const [medications, setMedications] = useState("")
    const [notes, setNotes] = useState("")
    const [followUp, setFollowUp] = useState(false)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true)
                const { data } = await api.get("/doctor/appointments")
                const appts = Array.isArray(data.appointments) ? data.appointments : []
                setAllAppointments(appts)

                if (appointmentId) {
                    const found = appts.find((a: any) => a.id === appointmentId)
                    if (found) {
                        setAppointment(found)
                    } else {
                        toast.error("Appointment not found.")
                    }
                }
            } catch (err: any) {
                toast.error("Failed to load appointments.")
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [appointmentId])

    const handleSaveDraft = async () => {
        if (!appointmentId) return
        try {
            setSavingDraft(true)
            await api.post("/doctor/prescriptions", {
                appointmentId,
                diagnosis: diagnosis.trim() || null,
                medications: medications.trim() || null,
                notes: notes.trim() || null,
                follow_up_required: followUp,
                draft_status: "draft",
            })
            toast.success("Draft saved — appointment remains open.")
        } catch (err: any) {
            toast.error(`Failed to save draft: ${err?.response?.data?.error || err.message}`)
        } finally {
            setSavingDraft(false)
        }
    }

    const handleSubmit = async () => {
        if (!appointmentId) return
        if (!diagnosis.trim() && !medications.trim()) {
            toast.error("Please enter at least a diagnosis or medications before submitting.")
            return
        }
        try {
            setSaving(true)
            await api.post("/doctor/prescriptions", {
                appointmentId,
                diagnosis: diagnosis.trim() || null,
                medications: medications.trim() || null,
                notes: notes.trim() || null,
                follow_up_required: followUp,
                draft_status: "final",
            })
            await api.patch(`/doctor/appointments/${appointmentId}/status`, { status: "completed" })
            setCompleted(true)
            toast.success("Consultation submitted successfully!")
            setTimeout(() => router.push("/doctor/patients"), 1500)
        } catch (err: any) {
            toast.error(`Failed to submit: ${err?.response?.data?.error || err.message}`)
        } finally {
            setSaving(false)
        }
    }

    // No appointment ID — show the list of pending appointments
    if (!appointmentId) {
        return <SelectPatientState appointments={allAppointments} loading={loading} />
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    // ID given but not found
    if (!appointment) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                    <FileText className="w-9 h-9 text-red-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Appointment Not Found</h2>
                <p className="text-sm text-gray-400">This appointment may have been cancelled or completed.</p>
                <Button variant="outline" onClick={() => router.push("/doctor/patients")} className="rounded-2xl font-bold border-gray-200">
                    Back to Patients
                </Button>
            </div>
        )
    }

    if (completed) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Consultation Complete</h2>
                <p className="text-sm text-gray-500">Redirecting to patients list…</p>
            </div>
        )
    }

    const getTriageColor = (t?: string) => {
        switch (t?.toUpperCase()) {
            case "CRITICAL": return "bg-red-100 text-red-700 border-red-200"
            case "HIGH": return "bg-orange-100 text-orange-700 border-orange-200"
            case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200"
            default: return "bg-green-100 text-green-700 border-green-200"
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/doctor/consultations")} className="rounded-xl">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Consultation</h1>
                    <p className="text-sm text-gray-500">Document diagnosis, prescription, and notes</p>
                </div>
            </div>

            {/* Patient Info */}
            <Card className="p-6 rounded-3xl border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Patient</p>
                        <h2 className="text-xl font-bold text-gray-900">{appointment.patient_name || "Unknown Patient"}</h2>
                        <p className="text-sm text-gray-500 mt-1">{appointment.symptoms || "No symptoms recorded"}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <Badge className={cn("text-xs font-bold px-3 py-1 border", getTriageColor(appointment.triage))}>
                            {appointment.triage || "LOW"} Triage
                        </Badge>
                        <p className="text-xs text-gray-400">{new Date(appointment.scheduled_at).toLocaleString()}</p>
                    </div>
                </div>
            </Card>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl"><Stethoscope className="w-4 h-4 text-blue-600" /></div>
                        <h3 className="font-bold text-gray-900">Diagnosis</h3>
                    </div>
                    <textarea className="w-full h-36 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Enter clinical diagnosis…" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                </Card>

                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-50 rounded-xl"><Pill className="w-4 h-4 text-green-600" /></div>
                        <h3 className="font-bold text-gray-900">Medications</h3>
                    </div>
                    <textarea className="w-full h-36 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        placeholder="e.g. Paracetamol 500mg × 3/day × 5 days" value={medications} onChange={e => setMedications(e.target.value)} />
                </Card>

                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl"><StickyNote className="w-4 h-4 text-amber-600" /></div>
                        <h3 className="font-bold text-gray-900">Clinical Notes</h3>
                    </div>
                    <textarea className="w-full h-36 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Additional observations or instructions…" value={notes} onChange={e => setNotes(e.target.value)} />
                </Card>

                <Card className="p-6 rounded-3xl border-none shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-50 rounded-xl"><CalendarCheck className="w-4 h-4 text-purple-600" /></div>
                        <h3 className="font-bold text-gray-900">Follow-up Required?</h3>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <button onClick={() => setFollowUp(true)}
                            className={cn("flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all",
                                followUp ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-500 hover:border-purple-300")}>
                            Yes, schedule follow-up
                        </button>
                        <button onClick={() => setFollowUp(false)}
                            className={cn("flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all",
                                !followUp ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400")}>
                            No follow-up
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        {followUp ? "Patient will be notified to schedule a follow-up." : "No additional appointments required at this time."}
                    </p>
                </Card>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={handleSaveDraft} disabled={savingDraft || saving}
                    className="rounded-2xl border-gray-200 font-bold px-6 gap-2">
                    {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Draft
                </Button>
                <Button onClick={handleSubmit} disabled={saving || savingDraft}
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 gap-2 shadow-lg shadow-blue-100">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Submit & Complete
                </Button>
            </div>
        </div>
    )
}
