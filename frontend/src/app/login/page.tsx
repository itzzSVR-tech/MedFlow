"use client"

import Link from "next/link";
import { Activity, Mail, Lock, ArrowRight, UserCircle, Stethoscope } from "lucide-react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole, Role } from "@/contexts/role-context";


export default function Login() {
    const { signIn, isLoaded, setActive } = useSignIn();
    const { user, isLoaded: userLoaded, isSignedIn } = useUser();
    const { role, setRole } = useRole();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Redirect if already signed in
    useEffect(() => {
        if (userLoaded && isSignedIn) {
            router.push(role === "DOCTOR" ? "/doctor" : "/admin");
        }
    }, [userLoaded, isSignedIn, role, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError("");
        setLoading(true);

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                setRole(selectedRole);
                router.push(selectedRole === "ADMIN" ? "/admin" : "/doctor");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid email or password. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (strategy: "oauth_github" | "oauth_google") => {
        if (!isLoaded) return;

        try {
            setRole(selectedRole);
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: selectedRole === "ADMIN" ? "/admin" : "/doctor",
            });
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "OAuth sign in failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-100/50 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-100/50 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-100 relative z-10 overflow-hidden">
                <div className="p-8 md:p-10">
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                                <Activity className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">MedFlow</span>
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-center text-gray-500 mb-8">Sign in to access your dashboard</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setSelectedRole("ADMIN")}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedRole === "ADMIN"
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50"}`}
                            >
                                <UserCircle className={`w-6 h-6 mb-2 ${selectedRole === "ADMIN" ? "text-blue-500" : "text-gray-400"}`} />
                                <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole("DOCTOR")}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedRole === "DOCTOR"
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50"}`}
                            >
                                <Stethoscope className={`w-6 h-6 mb-2 ${selectedRole === "DOCTOR" ? "text-blue-500" : "text-gray-400"}`} />
                                <span className="text-xs font-bold uppercase tracking-wider">Doctor</span>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="doctor@medflow.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <Link href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-sm text-gray-400 font-medium">OR</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <button
                        onClick={() => handleOAuthSignIn("oauth_google")}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-3 transition-colors active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-blue-500 font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
