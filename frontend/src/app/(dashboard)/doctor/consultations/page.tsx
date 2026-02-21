"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Stethoscope,
    FileText,
    Pill,
    ArrowLeft,
    CheckCircle2,
    Save,
    Calendar,
    User
} from "lucide-react"
import { mockDoctorPatients } from "@/constants/doctor-mock-data"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ConsultationPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const patientId = searchParams.get("id")

    const [patient, setPatient] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [diagnosis, setDiagnosis] = useState("")
    const [prescription, setPrescription] = useState("")
    const [notes, setNotes] = useState("")
    const [followUp, setFollowUp] = useState(false)

    useEffect(() => {
        if (patientId) {
            const found = mockDoctorPatients.find(p => p.id === patientId)
            setPatient(found || null)
        }
        setIsLoading(false)
    }, [patientId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Consultation completed", {
            description: `Session for ${patient?.name} has been saved.`
        })

        setIsSubmitting(false)
        router.push("/doctor/patients")
    }

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading patient data...</div>
    if (!patientId) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No Patient Selected</h2>
                <p className="text-gray-500 max-w-xs text-center mt-2">Please select a patient from the patient list to start a consultation.</p>
                <Button
                    variant="outline"
                    className="mt-6 rounded-xl font-bold"
                    onClick={() => router.push("/doctor/patients")}
                >
                    Go to Patient List
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Consultation</h1>
                    <p className="text-gray-500 text-sm">Session started at 10:45 AM</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Summary Card */}
                <Card className="p-6 rounded-3xl border-none shadow-sm h-fit space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30 mb-4">
                            {patient?.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{patient?.name}</h3>
                        <p className="text-sm text-gray-500">{patient?.id} • {patient?.age} Years • Male</p>
                        <Badge variant="outline" className="mt-3 rounded-full bg-red-50 text-red-600 border-red-100 font-bold px-4">
                            {patient?.triage} PRIORITY
                        </Badge>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Presented Symptoms</p>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{patient?.symptoms}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Ward</p>
                            <p className="text-sm text-gray-700 font-medium">{patient?.ward}</p>
                        </div>
                    </div>
                </Card>

                {/* Consultation Form */}
                <Card className="lg:col-span-2 p-8 rounded-3xl border-none shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Stethoscope className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-gray-900">Clinical Assessment</h3>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700">Diagnosis</label>
                                <textarea
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 min-h-[120px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm placeholder:text-gray-400"
                                    placeholder="Enter clinical diagnosis..."
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Pill className="w-4 h-4 text-purple-500" />
                                    <label className="text-sm font-bold text-gray-700">Prescription</label>
                                </div>
                                <textarea
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 min-h-[100px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm placeholder:text-gray-400"
                                    placeholder="Add medication, dosage, and frequency..."
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-500" />
                                    <label className="text-sm font-bold text-gray-700">Internal Notes</label>
                                </div>
                                <textarea
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 min-h-[100px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm placeholder:text-gray-400 text-gray-600"
                                    placeholder="Private observations or lab requests..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                <div className="flex items-center gap-3 text-blue-800">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-bold">Schedule Follow-up</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFollowUp(!followUp)}
                                    className={cn(
                                        "w-12 h-6 rounded-full p-1 transition-all duration-300",
                                        followUp ? "bg-blue-600" : "bg-gray-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                        followUp ? "ml-6" : "ml-0"
                                    )} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold h-14 rounded-2xl shadow-lg shadow-blue-500/25 gap-3"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                {isSubmitting ? "Saving..." : "Complete Consultation"}
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                className="h-14 px-8 rounded-2xl border-gray-200 font-bold gap-2 text-gray-500 hover:text-gray-900"
                            >
                                <Save className="w-5 h-5" />
                                Draft
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
