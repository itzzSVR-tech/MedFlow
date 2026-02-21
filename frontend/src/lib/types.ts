export type TriageLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Appointment {
    id: string;
    type?: string;
    status: string;
    scheduled_at: string;
    patient_name?: string;
    triage?: TriageLevel;
    doctors?: {
        users: {
            full_name: string;
        }
    };
}
