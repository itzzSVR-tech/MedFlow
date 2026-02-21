-- =====================================================================
-- MedFlow SaaS Hospital Management System — Schema v2
-- Multi-tenant architecture: all data scoped by hospital_id
-- =====================================================================

-- 1. Hospitals (Tenants)
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (Internal mapping for Supabase auth users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'doctor')) NOT NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT,
    full_name TEXT,
    status TEXT CHECK (status IN ('Active', 'Suspended')) DEFAULT 'Active'
);

-- 3. Doctors (Extra clinical profile for users with role='doctor')
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL DEFAULT 'General Practice',
    availability_status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Beds
CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    ward TEXT NOT NULL,
    type TEXT CHECK (type IN ('ICU', 'General', 'Isolation')) NOT NULL,
    status TEXT CHECK (status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')) DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID,
    patient_name TEXT,
    symptoms TEXT,
    triage TEXT CHECK (triage IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'LOW',
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Prescriptions (fully featured — no silent drops)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis TEXT,
    notes TEXT,
    medications TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    draft_status TEXT CHECK (draft_status IN ('draft', 'final')) DEFAULT 'final',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Hospital Settings (per-tenant configuration)
CREATE TABLE IF NOT EXISTS hospital_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID UNIQUE REFERENCES hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    surge_alert_threshold INTEGER DEFAULT 80,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES (performance on high-frequency filter columns)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_beds_hospital_id ON beds(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_hospital_id ON prescriptions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: get the hospital_id for the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_hospital_id() RETURNS UUID AS $$
    SELECT hospital_id FROM users WHERE supabase_uid = auth.uid()::text LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RLS Policies: strict hospital isolation on all tables
-- (DROP IF EXISTS + CREATE is the correct idempotent pattern in PostgreSQL)
DROP POLICY IF EXISTS hospital_isolation_hospitals ON hospitals;
CREATE POLICY hospital_isolation_hospitals ON hospitals
    FOR ALL USING (id = get_my_hospital_id());

DROP POLICY IF EXISTS hospital_isolation_users ON users;
CREATE POLICY hospital_isolation_users ON users
    FOR ALL USING (hospital_id = get_my_hospital_id());

DROP POLICY IF EXISTS hospital_isolation_doctors ON doctors;
CREATE POLICY hospital_isolation_doctors ON doctors
    FOR ALL USING (hospital_id = get_my_hospital_id());

DROP POLICY IF EXISTS hospital_isolation_beds ON beds;
CREATE POLICY hospital_isolation_beds ON beds
    FOR ALL USING (hospital_id = get_my_hospital_id());

DROP POLICY IF EXISTS hospital_isolation_appointments ON appointments;
CREATE POLICY hospital_isolation_appointments ON appointments
    FOR ALL USING (hospital_id = get_my_hospital_id());

DROP POLICY IF EXISTS hospital_isolation_prescriptions ON prescriptions;
CREATE POLICY hospital_isolation_prescriptions ON prescriptions
    FOR ALL USING (hospital_id = get_my_hospital_id());

DROP POLICY IF EXISTS hospital_isolation_settings ON hospital_settings;
CREATE POLICY hospital_isolation_settings ON hospital_settings
    FOR ALL USING (hospital_id = get_my_hospital_id());

-- =====================================================================
-- MIGRATION ALTERS (run when upgrading from v1)
-- Add new columns to prescriptions if they don't exist
-- =====================================================================
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medications TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS draft_status TEXT CHECK (draft_status IN ('draft', 'final')) DEFAULT 'final';

-- Add patient columns to appointments if they don't exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS triage TEXT CHECK (triage IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'LOW';

-- Ensure user_id is unique in doctors (prevent duplicate doctor profiles)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'doctors_user_id_unique'
    ) THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
    END IF;
END $$;
