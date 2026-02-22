import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    profile: any | null;
    setAuth: (user: any, profile: any) => void;
    clearAuth: () => void;
}

interface MetricsState {
    hospitalMetrics: any | null;
    setMetrics: (metrics: any) => void;
    updateMetric: (key: string, value: any) => void;
}

interface OperationsState {
    activeAppointments: any[];
    beds: any[];
    setAppointments: (appts: any[]) => void;
    setBeds: (beds: any[]) => void;
    updateAppointment: (id: string, updates: any) => void;
    addAppointment: (appt: any) => void;
}

interface UIState {
    sidebarOpen: boolean;
    pendingActions: Set<string>;
    toggleSidebar: () => void;
    startAction: (actionId: string) => void;
    stopAction: (actionId: string) => void;
}

export const useAppStore = create<AuthState & MetricsState & OperationsState & UIState>()(
    persist(
        (set) => ({
            // Auth Slice
            user: null,
            profile: null,
            setAuth: (user, profile) => set({ user, profile }),
            clearAuth: () => set({ user: null, profile: null }),

            // Metrics Slice
            hospitalMetrics: null,
            setMetrics: (hospitalMetrics) => set({ hospitalMetrics }),
            updateMetric: (key, value) => set((state) => ({
                hospitalMetrics: state.hospitalMetrics ? { ...state.hospitalMetrics, [key]: value } : { [key]: value }
            })),

            // Operations Slice
            activeAppointments: [],
            beds: [],
            setAppointments: (activeAppointments) => set({ activeAppointments }),
            setBeds: (beds) => set({ beds }),
            updateAppointment: (id, updates) => set((state) => ({
                activeAppointments: state.activeAppointments.map((a) => a.id === id ? { ...a, ...updates } : a)
            })),
            addAppointment: (appt) => set((state) => ({
                activeAppointments: [appt, ...state.activeAppointments]
            })),

            // UI Slice
            sidebarOpen: true,
            pendingActions: new Set(),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            startAction: (actionId) => set((state) => {
                const next = new Set(state.pendingActions);
                next.add(actionId);
                return { pendingActions: next };
            }),
            stopAction: (actionId) => set((state) => {
                const next = new Set(state.pendingActions);
                next.delete(actionId);
                return { pendingActions: next };
            }),
        }),
        {
            name: 'medflow-storage',
            partialize: (state) => ({
                hospitalMetrics: state.hospitalMetrics,
                sidebarOpen: state.sidebarOpen
            }), // Only persist non-sensitive, high-value UX items
        }
    )
);
