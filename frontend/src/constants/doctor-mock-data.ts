export type TriageLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface DoctorPatient {
    id: string
    name: string
    age: number
    symptoms: string
    triage: TriageLevel
    status: "Waiting" | "In Consultation" | "Completed" | "Referred"
    arrivalTime: string
    ward: string
}

export const mockDoctorPatients: DoctorPatient[] = [
    { id: "P001", name: "Aarav Mehta", age: 34, symptoms: "Chest pain, shortness of breath", triage: "CRITICAL", status: "Waiting", arrivalTime: "08:15", ward: "Emergency" },
    { id: "P002", name: "Priya Sharma", age: 27, symptoms: "High fever, severe headache", triage: "HIGH", status: "In Consultation", arrivalTime: "08:40", ward: "General" },
    { id: "P003", name: "Rohan Das", age: 52, symptoms: "Abdominal pain, nausea", triage: "HIGH", status: "Waiting", arrivalTime: "09:00", ward: "General" },
    { id: "P004", name: "Sunita Verma", age: 61, symptoms: "Joint pain, swelling in knees", triage: "MEDIUM", status: "Waiting", arrivalTime: "09:15", ward: "Orthopedic" },
    { id: "P005", name: "Kiran Reddy", age: 19, symptoms: "Rash, mild fever", triage: "LOW", status: "Waiting", arrivalTime: "09:30", ward: "General" },
    { id: "P006", name: "Ananya Iyer", age: 45, symptoms: "Dizziness, blurred vision", triage: "HIGH", status: "Completed", arrivalTime: "07:30", ward: "Neurology" },
    { id: "P007", name: "Vikram Singh", age: 38, symptoms: "Persistent cough, fatigue", triage: "MEDIUM", status: "Completed", arrivalTime: "07:50", ward: "Pulmonary" },
    { id: "P008", name: "Deepa Nair", age: 29, symptoms: "Lower back pain", triage: "LOW", status: "Referred", arrivalTime: "08:00", ward: "Orthopedic" },
]

export const weeklyConsultationsData = [
    { day: "Mon", consultations: 12, completed: 10 },
    { day: "Tue", consultations: 18, completed: 16 },
    { day: "Wed", consultations: 15, completed: 13 },
    { day: "Thu", consultations: 22, completed: 19 },
    { day: "Fri", consultations: 20, completed: 18 },
    { day: "Sat", consultations: 10, completed: 9 },
    { day: "Sun", consultations: 6, completed: 6 },
]

export const mockDoctorProfile = {
    name: "Dr. Arjun Kapoor",
    specialization: "Internal Medicine",
    department: "General Medicine",
    experience: "12 years",
    qualification: "MBBS, MD (Internal Medicine)",
    contact: "+91 98765 43210",
    email: "arjun.kapoor@medflow.com",
    patients: 248,
    rating: 4.9,
    joinedYear: 2013,
}
