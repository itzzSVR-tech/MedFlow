"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Activity, Mail, Lock, ArrowRight, Chrome, Shield, User as UserIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState("admin")
    const router = useRouter()
    const { signIn, signInWithGoogle, profile, user } = useAuth()

    // Handle redirection once profile is loaded after login
    useEffect(() => {
        if (user && profile) {
            if (profile.role === "admin") {
                router.push("/admin")
            } else if (profile.role === "doctor") {
                router.push("/doctor")
            }
        }
    }, [user, profile, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            await signIn(email, password)
            // Redirection is handled by the useEffect above once profile is fetched
        } catch (err: any) {
            setError(err.message || "Failed to log in. Please check your credentials.")
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            // Save intended role in localized storage to read after redirect
            localStorage.setItem("medflow_intended_role", activeTab === "admin" ? "admin" : "doctor");

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/login`,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
        } catch (err: any) {
            setError(err.message || "Google sign-in failed.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-100/50 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-indigo-100/50 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 relative z-10 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">MedFlow</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Sign in to your specialized dashboard</p>
                    </div>

                    <Tabs defaultValue="admin" className="w-full mb-8" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-2xl h-14">
                            <TabsTrigger
                                value="admin"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-bold flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Administrator
                            </TabsTrigger>
                            <TabsTrigger
                                value="doctor"
                                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-bold flex items-center gap-2"
                            >
                                <UserIcon className="w-4 h-4" />
                                Medical Staff
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                                {activeTab === "admin" ? "Admin Email" : "Staff Email"}
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all font-medium text-slate-900"
                                    placeholder={activeTab === "admin" ? "admin@hospital.com" : "doctor@hospital.com"}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all font-medium text-slate-900"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">Forgot Password?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : `Sign In as ${activeTab === "admin" ? "Admin" : "Staff"}`}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4 text-slate-300">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Or continue with</span>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full bg-white border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50 py-4 rounded-2xl font-bold text-slate-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <Chrome className="w-5 h-5 text-blue-600" />
                        Sign in with Google
                    </button>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm font-medium text-slate-600">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-600 font-bold hover:underline">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
