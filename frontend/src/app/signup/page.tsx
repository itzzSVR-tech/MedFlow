"use client";

import Link from "next/link";
import {
    Activity,
    Mail,
    Lock,
    ArrowRight,
    User,
    Building2,
    Chrome,
    Shield,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function Signup() {
    const { signInWithGoogle, signUp } = useAuth();
    const [activeTab, setActiveTab] = useState("admin");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        hospitalName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === "staff") {
            setError(
                "Staff signup is currently restricted. Please ask your Hospital Administrator for an invite link.",
            );
            return;
        }

        setLoading(true);
        setError("");
        try {
            const data = await signUp(formData.email, formData.password, {
                full_name: `${formData.firstName} ${formData.lastName}`,
                role: activeTab === "admin" ? "admin" : activeTab === "staff" ? "doctor" : "patient",
                hospital_name: activeTab === "admin" ? formData.hospitalName : undefined
            });

            if (data?.user) {
                router.push(
                    "/login?message=Check your email to confirm your account",
                );
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign up.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-100/50 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-indigo-100/50 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Hero/Info */}
                <div className="hidden md:flex w-full md:w-2/5 bg-blue-600 p-8 flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 opacity-90"></div>
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-6">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">
                            {activeTab === "admin"
                                ? "Register Hospital"
                                : activeTab === "staff"
                                    ? "Medical Staff Portal"
                                    : "Join as Patient"}
                        </h3>
                        <p className="text-blue-100 leading-relaxed text-sm">
                            {activeTab === "admin"
                                ? "Empower your facility with MedFlow's unified OS. Start your administrator journey now."
                                : activeTab === "staff"
                                    ? "Join your hospital network and collaborate with your medical team in real-time."
                                    : "Take control of your health. Book appointments and track your care with ease."}
                        </p>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-blue-200">
                        &copy; 2026 MedFlow
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-3/5 p-8 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Create Account
                        </h2>
                        <Link
                            href="/"
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ✕
                        </Link>
                    </div>

                    <Tabs
                        defaultValue="admin"
                        className="w-full mb-8"
                        onValueChange={setActiveTab}
                    >
                        <TabsList className="grid w-full grid-cols-3 p-1 bg-slate-100 rounded-2xl h-12">
                            <TabsTrigger
                                value="admin"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-bold flex items-center gap-2 text-xs"
                            >
                                <Shield className="w-3.5 h-3.5" />
                                Admin
                            </TabsTrigger>
                            <TabsTrigger
                                value="staff"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-bold flex items-center gap-2 text-xs"
                            >
                                <Users className="w-3.5 h-3.5" />
                                Doctor
                            </TabsTrigger>
                            <TabsTrigger
                                value="patient"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-bold flex items-center gap-2 text-xs"
                            >
                                <User className="w-3.5 h-3.5" />
                                Patient
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    {activeTab === "admin" || activeTab === "patient" ? (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                        First Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                            placeholder="John"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                        Last Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                            placeholder="Doe"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {activeTab === "admin" && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                        Hospital Name
                                    </label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="hospitalName"
                                            value={formData.hospitalName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                            placeholder="General Hospital"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                        placeholder="john@hospital.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Initializing..."
                                        : `Register ${activeTab === "admin" ? "Hospital Admin" : "Patient"}`}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                        First Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                            placeholder="Dr. John"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                        Last Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                            placeholder="Smith"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                    Staff Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                        placeholder="doctor@hospital.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                    Secure Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 outline-none transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Registering..." : "Join Medical Team"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8">
                        <button
                            onClick={() => signInWithGoogle(activeTab === "staff" ? "doctor" : activeTab)}
                            className="w-full h-14 bg-white border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50 rounded-2xl transition-all font-bold text-slate-700 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Chrome className="w-5 h-5 text-blue-600" />
                            Continue with Google
                        </button>
                    </div>

                    <p className="text-center text-slate-500 text-sm mt-8 font-medium">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
