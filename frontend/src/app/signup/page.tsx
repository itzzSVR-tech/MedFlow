"use client"

import Link from "next/link";
import {
    Activity,
    Mail,
    Lock,
    ArrowRight,
    User,
    Building2,
} from "lucide-react";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Signup() {
    const { signUp, isLoaded, setActive } = useSignUp();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        hospitalName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setLoading(true);

        try {
            // Create the signup with email, password, and all data in metadata
            await signUp.create({
                emailAddress: formData.email,
                password: formData.password,
                unsafeMetadata: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    hospitalName: formData.hospitalName,
                },
            });

            // Send email verification code
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setVerifying(true);
        } catch (err: any) {
            console.error("Signup error:", err);
            const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "An error occurred during signup. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                router.push("/dashboard");
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid verification code. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-100/50 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-100/50 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-gray-100 relative z-10 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Hero/Info */}
                <div className="hidden md:flex w-full md:w-2/5 bg-blue-600 p-8 flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90"></div>
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-6">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">
                            Join MedFlow
                        </h3>
                        <p className="text-blue-100 leading-relaxed text-sm">
                            Start modernizing your healthcare facility today.
                            Join 50+ hospitals already scaling with us.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-blue-200">
                        &copy; 2026 MedFlow
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-3/5 p-8 md:p-10">
                    <div className="flex justify-end mb-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {verifying ? "Verify Your Email" : "Create Account"}
                    </h2>
                    <p className="text-gray-500 mb-8 text-sm">
                        {verifying ? "Enter the code sent to your email" : "Get started with your free trial"}
                    </p>

                    {error && (
                        <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Clerk CAPTCHA container (invisible bot protection) */}
                    <div id="clerk-captcha" />

                    {!verifying ? (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                            placeholder="John"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                            placeholder="Doe"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Hospital Name
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="hospitalName"
                                        value={formData.hospitalName}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        placeholder="General Hospital"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        placeholder="john@hospital.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleVerify}>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-center tracking-widest"
                                    placeholder="000000"
                                    required
                                    disabled={loading}
                                    maxLength={6}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Verifying..." : "Verify Email"}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-gray-500 text-xs mt-6">
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
