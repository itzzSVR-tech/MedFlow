"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    Search,
    Star,
    ChevronRight,
    Video,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    CalendarCheck,
    Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    image: string;
    experience: string;
    availability: string[];
}

const doctors: Doctor[] = [
    {
        id: "1",
        name: "Dr. Sarah Smith",
        specialty: "General Practitioner",
        rating: 4.9,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200",
        experience: "12 years",
        availability: ["9:00 AM", "10:30 AM", "2:00 PM", "4:30 PM"],
    },
    {
        id: "2",
        name: "Dr. James Wilson",
        specialty: "Cardiologist",
        rating: 4.8,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
        experience: "15 years",
        availability: ["11:00 AM", "3:00 PM"],
    },
    {
        id: "3",
        name: "Dr. Emily Chen",
        specialty: "Pediatrician",
        rating: 5.0,
        reviews: 215,
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
        experience: "8 years",
        availability: ["8:30 AM", "1:30 PM", "3:30 PM"],
    },
];

export default function BookAppointment() {
    const [step, setStep] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState("2026-02-23");
    const [selectedTime, setSelectedTime] = useState("");
    const [visitType, setVisitType] = useState<"clinic" | "video">("video");

    const handleConfirm = () => {
        setStep(3);
    };

    if (step === 3) {
        return (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-100 ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Appointment Scheduled!
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">
                        Your visit with {selectedDoctor?.name} is confirmed.
                    </p>
                </div>

                <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white text-left space-y-6">
                    <div className="flex items-center gap-4 py-4 border-b border-slate-50">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Date & Time
                            </p>
                            <p className="text-sm font-bold text-slate-900 mt-1">
                                {selectedDate} at {selectedTime}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 py-4 border-b border-slate-50">
                        <Video className="w-5 h-5 text-purple-600" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Consultation Type
                            </p>
                            <p className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-tight">
                                {visitType} Appointment
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 py-4">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Location
                            </p>
                            <p className="text-sm font-bold text-slate-900 mt-1">
                                General Hospital, Main Wing, 4th Floor
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => (window.location.href = "/patient")}
                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                    >
                        Go to Dashboard
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-slate-100 font-bold text-slate-600"
                    >
                        Add to Calendar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Book Appointment
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Find and schedule visits with our specialized medical
                        team.
                    </p>
                </div>
                {step === 2 && (
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Selection
                    </button>
                )}
            </div>

            {step === 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Refine Search
                        </h4>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Specialty or name..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Type
                                </label>
                                <div className="space-y-2">
                                    {[
                                        "In-Person Visit",
                                        "Video Call",
                                        "Emergency Triage",
                                    ].map((t) => (
                                        <label
                                            key={t}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-50 hover:border-blue-100 cursor-pointer transition-all"
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded-md border-slate-200 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-xs font-bold text-slate-700">
                                                {t}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctor List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {doctors.map((doctor) => (
                                <Card
                                    key={doctor.id}
                                    className="p-6 rounded-[2rem] border-none shadow-xl hover:shadow-2xl transition-all bg-white group cursor-pointer"
                                    onClick={() => {
                                        setSelectedDoctor(doctor);
                                        setStep(2);
                                    }}
                                >
                                    <div className="flex gap-6">
                                        <Avatar className="h-20 w-20 rounded-2xl border-4 border-slate-50 group-hover:scale-105 transition-transform">
                                            <AvatarImage src={doctor.image} />
                                            <AvatarFallback className="bg-blue-600 text-white font-bold">
                                                {doctor.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                        {doctor.name}
                                                    </h3>
                                                    <p className="text-sm font-bold text-blue-600 mt-0.5">
                                                        {doctor.specialty}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    <span className="text-[10px] font-black">
                                                        {doctor.rating}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                                    <CalendarCheck className="w-3.5 h-3.5" />
                                                    NEXT: TODAY
                                                </div>
                                                <button className="text-blue-600 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    View Slots{" "}
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column - Booking Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white space-y-10">
                            {/* Visit Type */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    Visit Type
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setVisitType("video")}
                                        className={cn(
                                            "flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all text-center group",
                                            visitType === "video"
                                                ? "border-blue-600 bg-blue-50/50"
                                                : "border-slate-50 hover:border-blue-200",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "p-4 rounded-2xl transition-all",
                                                visitType === "video"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600",
                                            )}
                                        >
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 uppercase tracking-tight">
                                                Video Consultation
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500 mt-1">
                                                Join from anywhere
                                            </p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setVisitType("clinic")}
                                        className={cn(
                                            "flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all text-center group",
                                            visitType === "clinic"
                                                ? "border-blue-600 bg-blue-50/50"
                                                : "border-slate-50 hover:border-blue-200",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "p-4 rounded-2xl transition-all",
                                                visitType === "clinic"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600",
                                            )}
                                        >
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 uppercase tracking-tight">
                                                In-Clinic Visit
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500 mt-1">
                                                Meet in person
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    Available Slots (Tomorrow)
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {selectedDoctor?.availability.map(
                                        (time) => (
                                            <button
                                                key={time}
                                                onClick={() =>
                                                    setSelectedTime(time)
                                                }
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 font-bold text-xs transition-all",
                                                    selectedTime === time
                                                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                        : "border-slate-50 hover:border-blue-100 text-slate-600 hover:text-blue-600",
                                                )}
                                            >
                                                {time}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6 sticky top-24">
                        <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white space-y-8">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Booking Summary
                            </h4>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                                <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                                    <AvatarImage src={selectedDoctor?.image} />
                                    <AvatarFallback>
                                        {selectedDoctor?.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                                        {selectedDoctor?.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-blue-600 mt-0.5">
                                        {selectedDoctor?.specialty}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <CalendarIcon className="w-3.5 h-3.5" />{" "}
                                        Date
                                    </span>
                                    <span className="text-slate-900 uppercase tracking-tighter">
                                        Feb 23, 2026
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Time
                                    </span>
                                    <span className="text-slate-900 uppercase tracking-tighter">
                                        {selectedTime || "Not Selected"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <Video className="w-3.5 h-3.5" /> Mode
                                    </span>
                                    <span className="text-blue-600 uppercase tracking-tighter">
                                        {visitType} Appointment
                                    </span>
                                </div>
                            </div>

                            <Button
                                disabled={!selectedTime}
                                onClick={handleConfirm}
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Confirm Booking
                            </Button>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
