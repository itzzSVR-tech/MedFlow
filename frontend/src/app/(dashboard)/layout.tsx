"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { RealtimeProvider } from "@/providers/realtime-provider"
import { useAppStore } from "@/store/use-app-store"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile, loading } = useAuth()
    const router = useRouter()
    const { setAuth } = useAppStore()

    useEffect(() => {
        if (!loading && !profile) {
            router.push("/login")
        }
    }, [profile, loading, router])

    useEffect(() => {
        if (profile) {
            setAuth(null, profile) // Syncing profile to Zustand global store
        }
    }, [profile, setAuth])

    if (loading || !profile) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">
                        Hydrating Operational HUD...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <RealtimeProvider hospitalId={profile.hospital_id}>
            <div className="min-h-screen bg-slate-50 transition-all duration-500">
                {children}
            </div>
        </RealtimeProvider>
    )
}
