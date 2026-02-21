"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"

export type Role = "ADMIN" | "DOCTOR" | null
export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "OFF DUTY"

interface RoleContextValue {
    role: Role
    setRole: (role: Role) => void
    clearRole: () => void
    availability: AvailabilityStatus
    setAvailability: (status: AvailabilityStatus) => void
}

const RoleContext = createContext<RoleContextValue>({
    role: null,
    setRole: () => { },
    clearRole: () => { },
    availability: "OFF DUTY",
    setAvailability: () => { },
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded: userLoaded } = useUser()
    const { signOut } = useClerk()
    const [role, setRoleState] = useState<Role>(null)
    const [availability, setAvailabilityState] = useState<AvailabilityStatus>("OFF DUTY")

    // Hydrate on mount
    useEffect(() => {
        const storedRole = localStorage.getItem("userRole") as Role
        if (storedRole) setRoleState(storedRole)

        const storedAvail = localStorage.getItem("doctorAvailability") as AvailabilityStatus
        if (storedAvail) setAvailabilityState(storedAvail)
    }, [])

    // Sync with Clerk sign-out
    useEffect(() => {
        if (userLoaded && !user) {
            setRoleState(null)
            localStorage.removeItem("userRole")
        }
    }, [user, userLoaded])

    const setRole = (r: Role) => {
        setRoleState(r)
        if (r) localStorage.setItem("userRole", r)
        else localStorage.removeItem("userRole")
    }

    const setAvailability = (status: AvailabilityStatus) => {
        setAvailabilityState(status)
        localStorage.setItem("doctorAvailability", status)
    }

    const clearRole = async () => {
        setRoleState(null)
        localStorage.removeItem("userRole")
        await signOut()
    }

    return (
        <RoleContext.Provider value={{ role, setRole, clearRole, availability, setAvailability }}>
            {children}
        </RoleContext.Provider>
    )
}

export function useRole() {
    return useContext(RoleContext)
}
