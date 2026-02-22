"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useAuth } from "./auth-context";
import api from "@/lib/api";
import { toast } from "sonner";

export type Role = "admin" | "doctor" | "patient";
export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "OFF DUTY";

// Backend uses lowercase values — map here
const toBackendStatus = (s: AvailabilityStatus) => s.toLowerCase() as string;
const fromBackendStatus = (s: string): AvailabilityStatus =>
    s.toUpperCase() as AvailabilityStatus;

interface RoleContextType {
    role: Role | null;
    setRole: (role: Role) => void;
    availability: AvailabilityStatus;
    setAvailability: (status: AvailabilityStatus) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
    const { profile, user } = useAuth();
    const [role, setRole] = useState<Role | null>(null);
    const [availability, setAvailability] =
        useState<AvailabilityStatus>("AVAILABLE");

    // Sync role with profile on load
    useEffect(() => {
        if (profile?.role) {
            setRole(profile.role as Role);
        }
    }, [profile]);

    // Load from localStorage as fallback or for persistence before profile loads
    useEffect(() => {
        const savedRole = localStorage.getItem("medflow_role") as Role;
        if (savedRole && !profile) {
            setRole(savedRole);
        }
    }, [profile]);

    // Load initial availability from backend doctor profile
    useEffect(() => {
        const loadAvailability = async () => {
            if (profile?.role !== "doctor" || !user) return;
            try {
                const { data } = await api.get("/doctor/profile");
                const doctorProfile = data?.doctors?.[0] || data?.doctorProfile;
                if (doctorProfile?.availability_status) {
                    setAvailability(
                        fromBackendStatus(doctorProfile.availability_status),
                    );
                }
            } catch {
                // Non-fatal: falls back to default AVAILABLE
            }
        };
        loadAvailability();
    }, [profile, user]);

    const handleSetRole = (newRole: Role) => {
        setRole(newRole);
        localStorage.setItem("medflow_role", newRole);
    };

    const handleSetAvailability = useCallback(
        async (status: AvailabilityStatus) => {
            const prev = availability;
            setAvailability(status); // Optimistic update
            if (role === "doctor" && user) {
                try {
                    await api.patch("/doctor/availability", {
                        status: toBackendStatus(status),
                    });
                    toast.success(`Status updated to ${status.toLowerCase()}`);
                } catch (err) {
                    setAvailability(prev); // Rollback on error
                    toast.error(
                        "Failed to update availability. Please try again.",
                    );
                    console.error("Failed to sync availability:", err);
                }
            }
        },
        [availability, role, user],
    );

    return (
        <RoleContext.Provider
            value={{
                role,
                setRole: handleSetRole,
                availability,
                setAvailability: handleSetAvailability,
            }}
        >
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error("useRole must be used within a RoleProvider");
    }
    return context;
};
