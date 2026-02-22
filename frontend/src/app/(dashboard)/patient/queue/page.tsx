"use client";

import { Card } from "@/components/ui/card";
import {
    Clock,
    ArrowUpRight,
    Users,
    ChevronRight,
    Stethoscope,
    CheckCircle2,
    RefreshCcw,
    Zap,
    MapPin,
    Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QueueTracking() {
    const queueData = {
        position: 4,
        ahead: 3,
        estimatedTime: "24 min",
        clinic: "General Hospital - Cardiology Wing",
        doctor: "Dr. James Wilson",
        token: "MF-2410",
    };

    const steps = [
        {
            id: 1,
            title: "Arrived",
            status: "completed",
            time: "10:15 AM",
            icon: CheckCircle2,
        },
        {
            id: 2,
            title: "Triaged",
            status: "completed",
            time: "10:25 AM",
            icon: CheckCircle2,
        },
        { id: 3, title: "Waiting", status: "active", time: "Now", icon: Clock },
        {
            id: 4,
            title: "Consultation",
            status: "upcoming",
            time: "~10:55 AM",
            icon: Stethoscope,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Real-time Queue
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Track your live position and estimated arrival time.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    LIVE SYNC ACTIVE
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Status */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-10 rounded-[3rem] border-none shadow-2xl bg-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <Clock className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                            {/* Visual Position */}
                            <div className="relative shrink-0">
                                <svg className="w-48 h-48 -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        fill="none"
                                        stroke="#F1F5F9"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        fill="none"
                                        stroke="#2563EB"
                                        strokeWidth="12"
                                        strokeDasharray={552.92}
                                        strokeDashoffset={552.92 * (1 - 0.75)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">
                                        Position
                                    </span>
                                    <span className="text-6xl font-black text-slate-900 mt-1">
                                        {queueData.position}
                                    </span>
                                    <Badge className="bg-blue-600 text-[10px] font-bold mt-2 px-3 py-1 rounded-full">
                                        {queueData.token}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex-1 space-y-8 text-center md:text-left">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                                        Estimated Wait
                                    </h3>
                                    <p className="text-5xl font-black text-blue-600 tracking-tighter">
                                        {queueData.estimatedTime}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                Ahead
                                            </span>
                                        </div>
                                        <p className="text-xl font-black text-slate-900">
                                            {queueData.ahead} Patients
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <RefreshCcw className="w-4 h-4 text-purple-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                Last Update
                                            </span>
                                        </div>
                                        <p className="text-xl font-black text-slate-900">
                                            1 Min Ago
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Progress Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block"></div>

                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className="relative z-10 flex flex-col items-center text-center space-y-4"
                            >
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                        step.status === "completed"
                                            ? "bg-emerald-500 text-white"
                                            : step.status === "active"
                                              ? "bg-blue-600 text-white scale-125 ring-8 ring-blue-50"
                                              : "bg-white border-2 border-slate-100 text-slate-300",
                                    )}
                                >
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p
                                        className={cn(
                                            "text-xs font-black uppercase tracking-tight",
                                            step.status === "active"
                                                ? "text-blue-600"
                                                : "text-slate-500",
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                                        {step.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Info & Actions */}
                <div className="space-y-6">
                    <Card className="p-8 rounded-[2rem] border-none shadow-xl bg-white space-y-6">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Appointment Info
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Location
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {queueData.clinic}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Practitioner
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {queueData.doctor}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95">
                            Check In via Mobile
                        </Button>
                    </Card>

                    <Card className="p-8 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                            <Smartphone className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Smart Alerts
                                </h4>
                                <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                                    We'll text you when you're 1st in line. Feel
                                    free to explore the hospital cafe.
                                </p>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Notification
                                </span>
                                <Badge className="bg-emerald-500 text-white border-none font-black text-[10px]">
                                    ACTIVE
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    <button className="w-full flex items-center justify-between p-6 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:rotate-12 transition-transform">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                                Hospital Map
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>
            </div>
        </div>
    );
}
