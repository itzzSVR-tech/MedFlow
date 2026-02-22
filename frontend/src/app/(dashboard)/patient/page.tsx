"use client";

import { Card } from "@/components/ui/card";
import {
    Calendar,
    Video,
    Stethoscope,
    Clock,
    ChevronRight,
    CircleUser,
    ArrowUpRight,
    TrendingUp,
    Shield,
    Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
    const { profile } = useAuth();
    const router = useRouter();

    const quickActions = [
        {
            name: "AI Symptom Check",
            icon: Bot,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            description: "Check symptoms with our AI",
            href: "/patient/symptoms",
        },
        {
            name: "Book Appointment",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
            description: "Schedule clinical visits",
            href: "/patient/book",
        },
        {
            name: "Track My Queue",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            description: "Real-time clinic waiting",
            href: "/patient/queue",
        },
        {
            name: "Care Guidance",
            icon: Shield,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            description: "View post-care steps",
            href: "#",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Hello, {profile?.full_name?.split(" ")[0] || "there"} 👋
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Welcome back to your health center.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    SYSTEMS OPERATIONAL
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Appointments & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Appointment */}
                    <Card className="p-8 rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Calendar className="w-32 h-32" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase">
                                    Next Appointment
                                </Badge>
                                <button className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                                    <Video className="w-10 h-10 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                        Teleconsultation with Dr. Sarah Smith
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Today, 2:30 PM
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                            <CircleUser className="w-4 h-4 text-purple-500" />
                                            General Health Checkup
                                        </div>
                                    </div>
                                </div>
                                <Button className="rounded-2xl h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold transition-all active:scale-95">
                                    Join Room
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="p-6 rounded-3xl border-none shadow-md bg-white hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                                        Last Visit
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        Feb 12, 2026
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                You had a follow-up consultation with
                                Cardiology. Next vitals check in 4 days.
                            </p>
                        </Card>

                        <Card className="p-6 rounded-3xl border-none shadow-md bg-white hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                                        Health Status
                                    </p>
                                    <p className="text-sm font-bold text-emerald-600 mt-1">
                                        Operational
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <p className="text-[10px] font-bold text-slate-400">
                                    VITALS THRESHOLD
                                </p>
                                <p className="text-[10px] font-bold text-emerald-600">
                                    OPTIMAL
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                        Quick Actions
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        {quickActions.map((action) => (
                            <button
                                key={action.name}
                                onClick={() =>
                                    action.href !== "#" &&
                                    router.push(action.href)
                                }
                                className={cn(
                                    "flex items-center gap-5 p-5 rounded-3xl border transition-all text-left bg-white group hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.02] active:scale-[0.98]",
                                    action.border,
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-4 rounded-2xl transition-transform group-hover:rotate-6",
                                        action.bg,
                                        action.color,
                                    )}
                                >
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {action.name}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        {action.description}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>

                    {/* Help Card */}
                    <Card className="mt-8 p-6 rounded-3xl border-none bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Bot className="w-20 h-20" />
                        </div>
                        <div className="relative z-10">
                            <h5 className="font-bold text-lg mb-2">
                                Need Help?
                            </h5>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-medium">
                                Our AI assistants and support team are available
                                24/7 for your medical inquiries.
                            </p>
                            <Button
                                variant="secondary"
                                className="w-full rounded-2xl font-bold text-xs h-10 bg-white/10 text-white hover:bg-white/20 border-none"
                            >
                                Start Support Chat
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
