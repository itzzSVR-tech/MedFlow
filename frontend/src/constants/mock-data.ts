
import { Users, UserPlus, Calendar, Activity } from "lucide-react";

export interface StatCard {
    title: string;
    value: string;
    change: string;
    icon: any;
    trend: 'up' | 'down' | 'neutral';
}

export const adminStats: StatCard[] = [
    {
        title: "Total Users",
        value: "2,543",
        change: "+12.5% from last month",
        icon: Users,
        trend: 'up'
    },
    {
        title: "Active Doctors",
        value: "48",
        change: "+4 new this week",
        icon: UserPlus,
        trend: 'up'
    },
    {
        title: "Pending Approvals",
        value: "12",
        change: "Requires attention",
        icon: Activity,
        trend: 'neutral'
    },
    {
        title: "Total Appointments",
        value: "845",
        change: "+18% from last month",
        icon: Calendar,
        trend: 'up'
    }
];

export const hospitalActivityData = [
    { name: 'Mon', patients: 145, appointments: 89 },
    { name: 'Tue', patients: 230, appointments: 120 },
    { name: 'Wed', patients: 180, appointments: 95 },
    { name: 'Thu', patients: 278, appointments: 150 },
    { name: 'Fri', patients: 190, appointments: 110 },
    { name: 'Sat', patients: 120, appointments: 60 },
    { name: 'Sun', patients: 90, appointments: 40 },
];

export interface Doctor {
    id: string;
    name: string;
    email: string;
    specialization: string;
    licenseNumber: string;
    status: 'Active' | 'Pending' | 'Rejected';
    joinedDate: string;
    avatar: string;
}

export const mockDoctors: Doctor[] = [
    {
        id: "doc_1",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@medflow.com",
        specialization: "Cardiology",
        licenseNumber: "MED-554422",
        status: "Active",
        joinedDate: "2024-01-15",
        avatar: "https://i.pravatar.cc/150?u=doc_1"
    },
    {
        id: "doc_2",
        name: "Dr. James Chen",
        email: "james.chen@medflow.com",
        specialization: "Neurology",
        licenseNumber: "MED-998877",
        status: "Pending",
        joinedDate: "2024-03-10",
        avatar: "https://i.pravatar.cc/150?u=doc_2"
    },
    {
        id: "doc_3",
        name: "Dr. Emily Rodriguez",
        email: "emily.r@medflow.com",
        specialization: "Pediatrics",
        licenseNumber: "MED-112233",
        status: "Active",
        joinedDate: "2023-11-20",
        avatar: "https://i.pravatar.cc/150?u=doc_3"
    },
    {
        id: "doc_4",
        name: "Dr. Michael Chang",
        email: "m.chang@medflow.com",
        specialization: "Orthopedics",
        licenseNumber: "MED-776655",
        status: "Rejected",
        joinedDate: "2024-02-01",
        avatar: "https://i.pravatar.cc/150?u=doc_4"
    },
    {
        id: "doc_5",
        name: "Dr. Lisa Park",
        email: "lisa.park@medflow.com",
        specialization: "Dermatology",
        licenseNumber: "MED-334455",
        status: "Pending",
        joinedDate: "2024-03-12",
        avatar: "https://i.pravatar.cc/150?u=doc_5"
    }
];

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Patient' | 'Doctor' | 'Admin';
    status: 'Active' | 'Suspended';
    lastActive: string;
}

export const mockUsers: User[] = [
    { id: "usr_1", name: "Alice Johnson", email: "alice@example.com", role: "Patient", status: "Active", lastActive: "2 mins ago" },
    { id: "usr_2", name: "Bob Smith", email: "bob@example.com", role: "Patient", status: "Suspended", lastActive: "5 days ago" },
    { id: "usr_3", name: "Admin User", email: "admin@medflow.com", role: "Admin", status: "Active", lastActive: "Now" },
    ...mockDoctors.map(d => ({
        id: d.id,
        name: d.name,
        email: d.email,
        role: "Doctor" as const,
        status: d.status === 'Rejected' ? 'Suspended' as const : 'Active' as const,
        lastActive: "1 hour ago"
    }))
];

export interface Appointment {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    type: string;
}

export const mockAppointments: Appointment[] = [
    { id: "apt_1", patientName: "Alice Johnson", doctorName: "Dr. Sarah Wilson", date: "2024-03-20", time: "09:00 AM", status: "Scheduled", type: "Check-up" },
    { id: "apt_2", patientName: "Bob Smith", doctorName: "Dr. Emily Rodriguez", date: "2024-03-21", time: "10:30 AM", status: "Scheduled", type: "Vaccination" },
    { id: "apt_3", patientName: "Charlie Brown", doctorName: "Dr. James Chen", date: "2024-03-19", time: "02:00 PM", status: "Completed", type: "Consultation" },
    { id: "apt_4", patientName: "Diana Prince", doctorName: "Dr. Sarah Wilson", date: "2024-03-18", time: "11:15 AM", status: "Cancelled", type: "Follow-up" },
];

// ─── MedFlow Data ────────────────────────────────────────────────────

export interface KpiCard {
    id: string;
    title: string;
    value: string;
    unit?: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    sparkline: number[];
    color: string;
}

export const medflowKpis: KpiCard[] = [
    {
        id: "opd",
        title: "Total OPD Today",
        value: "347",
        trend: "up",
        trendValue: "+8.2%",
        sparkline: [210, 240, 255, 270, 280, 300, 315, 330, 347],
        color: "#0d9488"
    },
    {
        id: "emergency",
        title: "Emergency Cases",
        value: "24",
        trend: "up",
        trendValue: "+15%",
        sparkline: [10, 12, 14, 18, 20, 19, 22, 21, 24],
        color: "#ef4444"
    },
    {
        id: "bed_occ",
        title: "Bed Occupancy",
        value: "78",
        unit: "%",
        trend: "up",
        trendValue: "+3%",
        sparkline: [65, 68, 70, 71, 74, 75, 76, 77, 78],
        color: "#f59e0b"
    },
    {
        id: "icu",
        title: "ICU Utilization",
        value: "91",
        unit: "%",
        trend: "up",
        trendValue: "+6%",
        sparkline: [78, 80, 82, 85, 86, 88, 89, 90, 91],
        color: "#dc2626"
    },
    {
        id: "wait",
        title: "Avg Wait Time",
        value: "22",
        unit: "min",
        trend: "down",
        trendValue: "-4 min",
        sparkline: [35, 32, 30, 28, 27, 26, 25, 23, 22],
        color: "#6366f1"
    },
    {
        id: "doctors",
        title: "Active Doctors",
        value: "38",
        trend: "neutral",
        trendValue: "0",
        sparkline: [36, 38, 37, 38, 39, 38, 37, 38, 38],
        color: "#0891b2"
    }
];

export const hourlyPatientData = [
    { hour: "06:00", checkins: 12 },
    { hour: "07:00", checkins: 28 },
    { hour: "08:00", checkins: 55 },
    { hour: "09:00", checkins: 82 },
    { hour: "10:00", checkins: 110 },
    { hour: "11:00", checkins: 98 },
    { hour: "12:00", checkins: 75 },
    { hour: "13:00", checkins: 60 },
    { hour: "14:00", checkins: 88 },
    { hour: "15:00", checkins: 105 },
    { hour: "16:00", checkins: 92 },
    { hour: "17:00", checkins: 70 },
    { hour: "18:00", checkins: 45 },
    { hour: "19:00", checkins: 32 },
    { hour: "20:00", checkins: 20 },
];

export const bedOccupancyHeatmap = [
    { ward: "ICU", total: 20, occupied: 19, reserved: 1, maintenance: 0 },
    { ward: "General A", total: 40, occupied: 28, reserved: 4, maintenance: 2 },
    { ward: "General B", total: 40, occupied: 30, reserved: 3, maintenance: 1 },
    { ward: "Isolation", total: 15, occupied: 8, reserved: 2, maintenance: 1 },
    { ward: "Pediatric", total: 20, occupied: 12, reserved: 2, maintenance: 0 },
    { ward: "Maternity", total: 18, occupied: 10, reserved: 3, maintenance: 0 },
];

export const staffLoadData = [
    { name: "Dr. Sarah Wilson", patients: 14, specialty: "Cardiology" },
    { name: "Dr. Emily Rodriguez", patients: 18, specialty: "Pediatrics" },
    { name: "Dr. Raj Patel", patients: 22, specialty: "General" },
    { name: "Dr. Lisa Park", patients: 9, specialty: "Dermatology" },
    { name: "Dr. James Chen", patients: 16, specialty: "Neurology" },
    { name: "Dr. Anna Kowalski", patients: 25, specialty: "Emergency" },
];

// Surge risk: 0-100
export const surgeRiskLevel = 73;
export const surgeRiskLabel: "Low" | "Moderate" | "High" = "High";
export const surgeForecastMessage = "Projected ICU saturation in ~2 days based on current admission rate.";

export interface Bed {
    id: string;
    number: string;
    ward: string;
    type: 'ICU' | 'General' | 'Isolation';
    status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
    patient?: {
        name: string;
        admissionDate: string;
        predictedDischarge: string;
        diagnosis: string;
    };
}

export const mockBeds: Bed[] = [
    // ICU
    { id: "b1", number: "ICU-01", ward: "ICU Wing A", type: "ICU", status: "Occupied", patient: { name: "Marcus Reynolds", admissionDate: "2026-02-18", predictedDischarge: "2026-02-25", diagnosis: "Cardiac failure" } },
    { id: "b2", number: "ICU-02", ward: "ICU Wing A", type: "ICU", status: "Occupied", patient: { name: "Helen Carter", admissionDate: "2026-02-19", predictedDischarge: "2026-02-23", diagnosis: "Respiratory distress" } },
    { id: "b3", number: "ICU-03", ward: "ICU Wing A", type: "ICU", status: "Reserved", patient: { name: "—", admissionDate: "—", predictedDischarge: "—", diagnosis: "—" } },
    { id: "b4", number: "ICU-04", ward: "ICU Wing A", type: "ICU", status: "Occupied", patient: { name: "Alan Foster", admissionDate: "2026-02-20", predictedDischarge: "2026-02-28", diagnosis: "Post-op monitoring" } },
    { id: "b5", number: "ICU-05", ward: "ICU Wing A", type: "ICU", status: "Maintenance" },
    { id: "b6", number: "ICU-06", ward: "ICU Wing B", type: "ICU", status: "Occupied", patient: { name: "Priya Singh", admissionDate: "2026-02-17", predictedDischarge: "2026-02-24", diagnosis: "Sepsis" } },
    { id: "b7", number: "ICU-07", ward: "ICU Wing B", type: "ICU", status: "Occupied", patient: { name: "Thomas Webb", admissionDate: "2026-02-21", predictedDischarge: "2026-03-01", diagnosis: "Brain injury" } },
    { id: "b8", number: "ICU-08", ward: "ICU Wing B", type: "ICU", status: "Available" },
    // General
    { id: "b9", number: "GEN-01", ward: "General A", type: "General", status: "Occupied", patient: { name: "Dorothy Mills", admissionDate: "2026-02-20", predictedDischarge: "2026-02-23", diagnosis: "Appendicitis" } },
    { id: "b10", number: "GEN-02", ward: "General A", type: "General", status: "Available" },
    { id: "b11", number: "GEN-03", ward: "General A", type: "General", status: "Reserved" },
    { id: "b12", number: "GEN-04", ward: "General A", type: "General", status: "Occupied", patient: { name: "Simon Hayes", admissionDate: "2026-02-19", predictedDischarge: "2026-02-22", diagnosis: "Fracture" } },
    { id: "b13", number: "GEN-05", ward: "General A", type: "General", status: "Occupied", patient: { name: "Alice Green", admissionDate: "2026-02-18", predictedDischarge: "2026-02-21", diagnosis: "Pneumonia" } },
    { id: "b14", number: "GEN-06", ward: "General B", type: "General", status: "Maintenance" },
    { id: "b15", number: "GEN-07", ward: "General B", type: "General", status: "Occupied", patient: { name: "Kevin Brooks", admissionDate: "2026-02-21", predictedDischarge: "2026-02-24", diagnosis: "Typhoid" } },
    { id: "b16", number: "GEN-08", ward: "General B", type: "General", status: "Available" },
    { id: "b17", number: "GEN-09", ward: "General B", type: "General", status: "Available" },
    { id: "b18", number: "GEN-10", ward: "General B", type: "General", status: "Occupied", patient: { name: "Nora West", admissionDate: "2026-02-20", predictedDischarge: "2026-02-23", diagnosis: "Kidney stone" } },
    // Isolation
    { id: "b19", number: "ISO-01", ward: "Isolation Wing", type: "Isolation", status: "Occupied", patient: { name: "Peter Lane", admissionDate: "2026-02-19", predictedDischarge: "2026-02-26", diagnosis: "TB (active)" } },
    { id: "b20", number: "ISO-02", ward: "Isolation Wing", type: "Isolation", status: "Occupied", patient: { name: "Fiona Clarke", admissionDate: "2026-02-21", predictedDischarge: "2026-02-28", diagnosis: "Viral hemorrhagic" } },
    { id: "b21", number: "ISO-03", ward: "Isolation Wing", type: "Isolation", status: "Available" },
    { id: "b22", number: "ISO-04", ward: "Isolation Wing", type: "Isolation", status: "Reserved" },
    { id: "b23", number: "ISO-05", ward: "Isolation Wing", type: "Isolation", status: "Maintenance" },
];

export interface StaffMember {
    id: string;
    name: string;
    specialization: string;
    department: string;
    currentPatients: number;
    avgConsultMin: number;
    status: 'Normal' | 'Overloaded';
    avatar: string;
}

export const mockStaff: StaffMember[] = [
    { id: "s1", name: "Dr. Sarah Wilson", specialization: "Cardiology", department: "Cardiology", currentPatients: 14, avgConsultMin: 18, status: "Normal", avatar: "https://i.pravatar.cc/150?u=doc_1" },
    { id: "s2", name: "Dr. James Chen", specialization: "Neurology", department: "Neurology", currentPatients: 16, avgConsultMin: 22, status: "Normal", avatar: "https://i.pravatar.cc/150?u=doc_2" },
    { id: "s3", name: "Dr. Emily Rodriguez", specialization: "Pediatrics", department: "Pediatrics", currentPatients: 18, avgConsultMin: 15, status: "Normal", avatar: "https://i.pravatar.cc/150?u=doc_3" },
    { id: "s4", name: "Dr. Raj Patel", specialization: "General Medicine", department: "General", currentPatients: 25, avgConsultMin: 12, status: "Overloaded", avatar: "https://i.pravatar.cc/150?u=s4" },
    { id: "s5", name: "Dr. Anna Kowalski", specialization: "Emergency", department: "Emergency", currentPatients: 28, avgConsultMin: 10, status: "Overloaded", avatar: "https://i.pravatar.cc/150?u=s5" },
    { id: "s6", name: "Dr. Lisa Park", specialization: "Dermatology", department: "Dermatology", currentPatients: 9, avgConsultMin: 20, status: "Normal", avatar: "https://i.pravatar.cc/150?u=doc_5" },
    { id: "s7", name: "Dr. Kevin Omar", specialization: "Orthopedics", department: "Orthopedics", currentPatients: 12, avgConsultMin: 25, status: "Normal", avatar: "https://i.pravatar.cc/150?u=s7" },
    { id: "s8", name: "Dr. Nina Bell", specialization: "Pulmonology", department: "General", currentPatients: 22, avgConsultMin: 19, status: "Overloaded", avatar: "https://i.pravatar.cc/150?u=s8" },
];

export const opdTrendData = [
    { day: "Feb 8", opd: 215, fever: 38 },
    { day: "Feb 9", opd: 234, fever: 42 },
    { day: "Feb 10", opd: 220, fever: 40 },
    { day: "Feb 11", opd: 260, fever: 51 },
    { day: "Feb 12", opd: 278, fever: 58 },
    { day: "Feb 13", opd: 245, fever: 50 },
    { day: "Feb 14", opd: 289, fever: 62 },
    { day: "Feb 15", opd: 310, fever: 70 },
    { day: "Feb 16", opd: 295, fever: 65 },
    { day: "Feb 17", opd: 330, fever: 78 },
    { day: "Feb 18", opd: 318, fever: 72 },
    { day: "Feb 19", opd: 342, fever: 82 },
    { day: "Feb 20", opd: 335, fever: 80 },
    { day: "Feb 21", opd: 347, fever: 86 },
];

export const patientFlowData = [
    { hour: "00:00", admissions: 3, discharges: 2 },
    { hour: "02:00", admissions: 2, discharges: 1 },
    { hour: "04:00", admissions: 4, discharges: 1 },
    { hour: "06:00", admissions: 8, discharges: 3 },
    { hour: "08:00", admissions: 22, discharges: 10 },
    { hour: "10:00", admissions: 38, discharges: 18 },
    { hour: "12:00", admissions: 30, discharges: 25 },
    { hour: "14:00", admissions: 35, discharges: 28 },
    { hour: "16:00", admissions: 40, discharges: 32 },
    { hour: "18:00", admissions: 28, discharges: 20 },
    { hour: "20:00", admissions: 18, discharges: 12 },
    { hour: "22:00", admissions: 10, discharges: 8 },
];
