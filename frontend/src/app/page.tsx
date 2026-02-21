"use client";

import Link from "next/link";
import {
    ShieldCheck,
    Activity,
    Database,
    Zap,
    Users,
    CalendarCheck,
    FileText,
    Lock,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigation = (path: string) => {
        setIsNavigating(true);
        setTimeout(() => {
            router.push(path);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Activity className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                            MedFlow
                        </span>
                    </div>
                    {isLoaded &&
                        (user ? (
                            <button
                                onClick={() => handleNavigation("/admin")}
                                disabled={isNavigating}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {isNavigating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    "Dashboard"
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleNavigation("/login")}
                                disabled={isNavigating}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {isNavigating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    "Get Started"
                                )}
                            </button>
                        ))}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-white to-transparent opacity-70"></div>
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-[80px] mix-blend-multiply animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-[80px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-[80px] mix-blend-multiply animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>
                <div className="container mx-auto text-center max-w-4xl">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
                        ✨ AI-Driven Patient Care is Here
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tight leading-tight">
                        Healthcare,{" "}
                        <span className="text-blue-500">Unified.</span>
                        <br />
                        Secure. Intelligent.
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Empower your medical facility with a single source of
                        truth for patient data, operations, and compliance.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/demo"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all"
                        >
                            Book a Free Demo
                        </Link>
                        <Link
                            href="/features"
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5 text-blue-500" />
                            See How It Works
                        </Link>
                    </div>

                    {/* Dashboard Preview Mockup */}
                    <div className="relative mx-auto rounded-xl shadow-2xl border border-gray-200 bg-white overflow-hidden max-w-5xl aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/9] group text-left">
                        <div className="absolute inset-0 bg-gray-50 flex">
                            {/* Mock Sidebar */}
                            <div className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col hidden sm:flex">
                                <div className="h-14 flex items-center border-b border-gray-100 px-6 gap-2">
                                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                        <Activity className="text-white w-3 h-3" />
                                    </div>
                                    <span className="font-bold text-gray-800 hidden md:block">
                                        MedFlow
                                    </span>
                                </div>
                                <div className="p-4 space-y-1">
                                    {[
                                        "Dashboard",
                                        "Patients",
                                        "Appointments",
                                        "Analytics",
                                        "Settings",
                                    ].map((item, i) => (
                                        <div
                                            key={item}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${i === 0 ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded ${i === 0 ? "bg-blue-200" : "bg-gray-200"}`}
                                            ></div>
                                            <span className="hidden md:block">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mock Main Content */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Mock Header */}
                                <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
                                    <h3 className="font-bold text-gray-800">
                                        Overview
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-8 bg-gray-100 rounded-full hidden sm:block"></div>
                                        <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Mock Body */}
                                <div className="p-6 bg-gray-50/50 flex-1 overflow-hidden">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {[
                                            {
                                                label: "Total Patients",
                                                val: "12,405",
                                                trend: "+12%",
                                            },
                                            {
                                                label: "Appointments",
                                                val: "845",
                                                trend: "+5%",
                                            },
                                            {
                                                label: "Avg Wait Time",
                                                val: "14m",
                                                trend: "-2m",
                                            },
                                            {
                                                label: "Satisfaction",
                                                val: "98%",
                                                trend: "+1%",
                                            },
                                        ].map((stat, i) => (
                                            <div
                                                key={i}
                                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                                            >
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg mb-3"></div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {stat.val}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-6 h-full">
                                        {/* Big Chart Area */}
                                        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                                <div className="h-4 w-16 bg-gray-50 rounded"></div>
                                            </div>
                                            <div className="flex items-end gap-2 h-32 md:h-48">
                                                {[
                                                    40, 65, 45, 80, 55, 70, 40,
                                                    65, 45, 80, 55, 70,
                                                ].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-blue-500/10 rounded-t-sm relative group hover:bg-blue-500/20 transition-colors"
                                                        style={{
                                                            height: `${h}%`,
                                                        }}
                                                    >
                                                        <div
                                                            className="absolute bottom-0 w-full bg-blue-500"
                                                            style={{
                                                                height: `${h < 30 ? h : h / 2}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Side List */}
                                        <div className="w-64 bg-white rounded-xl border border-gray-100 shadow-sm p-5 hidden lg:block">
                                            <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                                        <div className="flex-1">
                                                            <div className="h-3 w-20 bg-gray-100 rounded mb-1"></div>
                                                            <div className="h-2 w-12 bg-gray-50 rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* macOS window dots overlay */}
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Healthcare Systems
                            <br />
                            Are{" "}
                            <span className="text-red-500 relative">
                                Broken
                                <svg
                                    className="absolute w-full h-3 -bottom-1 left-0 text-red-200 -z-10"
                                    viewBox="0 0 100 10"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0 5 Q 50 10 100 5"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                </svg>
                            </span>
                        </h2>
                        <p className="text-gray-600 mt-4">
                            Traditional software creates more problems than it
                            solves.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Database,
                                color: "bg-red-100 text-red-600",
                                title: "Fragmented Data",
                                desc: "Information scattered across paper records and legacy systems leads to critical care delays.",
                            },
                            {
                                icon: ShieldCheck,
                                color: "bg-orange-100 text-orange-600",
                                title: "Security Risks",
                                desc: "Outdated systems leave sensitive medical records vulnerable to cyber threats.",
                            },
                            {
                                icon: Users,
                                color: "bg-purple-100 text-purple-600",
                                title: "Manual Conflicts",
                                desc: "Double-booking and transcription errors wasting valuable time and resources.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-shadow"
                            >
                                <div
                                    className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6`}
                                >
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="py-24 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                Meet{" "}
                                <span className="text-blue-500">MedFlow</span>
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                The world's first unified hospital operating
                                system given new life. Designed for clinicians,
                                loved by patients, and trusted by IT.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Intelligent Patient Flow Management",
                                    "Automated Compliance Audits",
                                    "Real-time Resource Allocation",
                                ].map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-gray-700 font-medium"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <ShieldCheck className="w-3 h-3 text-green-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-100 aspect-square relative group">
                                {/* Placeholder for nature/modern image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                                    <span className="text-6xl">🌿</span>
                                </div>
                                {/* Floating Card */}
                                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            98%
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                                                Efficiency
                                            </p>
                                            <p className="text-lg font-bold text-gray-900">
                                                Improved Operations
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Powerful Features
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {[
                            {
                                icon: CalendarCheck,
                                title: "Smart Scheduling",
                                desc: "AI-driven scheduling optimizes wait times and reduces idle gaps.",
                            },
                            {
                                icon: FileText,
                                title: "Instant Reports",
                                desc: "Generate compliant clinical summaries in seconds.",
                            },
                            {
                                icon: Lock,
                                title: "Role-Based Access",
                                desc: "Bank-grade security ensures only authorized personnel access data.",
                            },
                            {
                                icon: TrendingUp,
                                title: "Predictive Triage",
                                desc: "Forecast patient volume to manage staff effectively.",
                            },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {f.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scale Section */}
            <section className="py-24 bg-blue-600 text-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Built for Scale
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                title: "Rapid Deployment",
                                desc: "Get your entire hospital online in days, not months. Cloud-native architecture.",
                            },
                            {
                                title: "99.9% Uptime",
                                desc: "Superior reliability with distributed systems and automatic failover.",
                            },
                            {
                                title: "HIPAA & GDPR",
                                desc: "Compliance is baked in, not an afterthought. Audit logs included.",
                            },
                            {
                                title: "Patient-Centric",
                                desc: "Designed around the patient journey for better health outcomes.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-blue-500/50 backdrop-blur border border-blue-400 p-8 rounded-2xl hover:bg-blue-500 transition-colors"
                            >
                                <h3 className="text-2xl font-bold mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-blue-100">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Future Section */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-4xl">
                    <p className="text-center text-blue-500 font-bold tracking-widest uppercase mb-4">
                        Roadmap
                    </p>
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
                        The Future of Care
                    </h2>

                    <div className="space-y-8">
                        {[
                            {
                                title: "Teleconsultation 3.0",
                                desc: "Integrated high-definition video with real-time vitals sync.",
                            },
                            {
                                title: "AI Triage Options",
                                desc: "Smart chatbot for pre-arrival symptom checking.",
                            },
                            {
                                title: "Predictive Analytics",
                                desc: "Forecasting patient flow and readmission chances using ML.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex gap-6 items-start group"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
                                    <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="bg-[#0B1120] rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl bg-blue-900/40 blur-[100px] rounded-full pointer-events-none"></div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
                            Ready to Modernize Your Hospital?
                        </h2>
                        <p className="text-gray-400 mb-10 max-w-2xl mx-auto relative z-10 text-lg">
                            Join 50+ leading healthcare providers already using
                            MedFlow.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link
                                href="/signup"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all"
                            >
                                Start a Free Trial
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg backdrop-blur transition-all"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 border-t border-gray-200">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                            <Activity className="text-white w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            MedFlow
                        </span>
                    </div>
                    <div className="flex justify-center gap-8 text-gray-500 text-sm mb-8">
                        <Link href="#" className="hover:text-blue-500">
                            Platform
                        </Link>
                        <Link href="#" className="hover:text-blue-500">
                            Pricing
                        </Link>
                        <Link href="#" className="hover:text-blue-500">
                            Security
                        </Link>
                        <Link href="#" className="hover:text-blue-500">
                            Help
                        </Link>
                    </div>
                    <p className="text-gray-400 text-xs">
                        &copy; {new Date().getFullYear()} MedFlow Technologies
                        Inc. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
