"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useRole, Role } from "@/contexts/role-context"

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles: Role[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const isSignedIn = !!user
    const isLoaded = !loading
    const { role } = useRole()
    const router = useRouter()

    useEffect(() => {
        if (isLoaded) {
            if (!isSignedIn) {
                router.replace("/login")
            } else if (role && !allowedRoles.includes(role)) {
                // If role exists but isn't allowed, redirect to login (or unauthorized)
                // For simplicity as requested: redirect to /login
                router.replace("/login")
            }
        }
    }, [isLoaded, isSignedIn, role, allowedRoles, router])

    if (!isLoaded || !isSignedIn || !role || !allowedRoles.includes(role)) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Verifying credentials…</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
