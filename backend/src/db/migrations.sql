-- =====================================================================
-- MedFlow Schema Alignment Migration — v3 (SAFE / IDEMPOTENT)
-- Purpose: Align actual Supabase DB with backend service contract.
-- Root cause: PGRST204 "Could not find column full_name on users"
--             = DB was created before full schema was applied.
-- Run this entire file in Supabase SQL Editor → Run.
-- All statements are safe to re-run on an already-correct schema.
-- =====================================================================

-- ─── 1. HOSPITALS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospitals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. USERS ────────────────────────────────────────────────────────
-- Canonical definition expected by: onboarding.service, auth.middleware,
-- admin.service (insert: supabase_uid, email, full_name, role, hospital_id, status)
-- doctor.service (update: full_name)
-- admin.service (update: status)

CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid TEXT UNIQUE NOT NULL,
    email        TEXT,
    full_name    TEXT,
    role         TEXT NOT NULL DEFAULT 'patient',
    hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'Active',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist (ADD COLUMN IF NOT EXISTS = no-op when already present)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();

-- Fix the role CHECK constraint to cover admin | doctor | patient
DO $$
BEGIN
    -- Drop any existing role constraint (whatever it was called)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check' AND conrelid = 'users'::regclass) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    -- Drop by common alternative name too
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_fkey' AND conrelid = 'users'::regclass) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_fkey;
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'doctor', 'patient'));

-- Fix the status CHECK constraint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check' AND conrelid = 'users'::regclass) THEN
        ALTER TABLE users DROP CONSTRAINT users_status_check;
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE users ADD CONSTRAINT users_status_check
    CHECK (status IN ('Active', 'Suspended'));

-- ─── 3. DOCTORS ──────────────────────────────────────────────────────
-- Expected by: doctor.service (user_id, hospital_id, specialization, availability_status)
--              admin.service  (id, specialization, availability_status, users(*))

CREATE TABLE IF NOT EXISTS doctors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    hospital_id         UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    specialization      TEXT NOT NULL DEFAULT 'General Practice',
    availability_status TEXT NOT NULL DEFAULT 'available',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialization      TEXT NOT NULL DEFAULT 'General Practice';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'available';

-- availability_status CHECK (only add if not present)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_availability_status_check' AND conrelid = 'doctors'::regclass) THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_availability_status_check
            CHECK (availability_status IN ('available', 'busy', 'off duty'));
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 4. PATIENTS ─────────────────────────────────────────────────────
-- Expected by: patient.service (user_id, hospital_id, date_of_birth, blood_type)

CREATE TABLE IF NOT EXISTS patients (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id   UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    date_of_birth DATE,
    blood_type    VARCHAR(5),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hospital_id)
);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_type    VARCHAR(5);

-- ─── 5. BEDS ─────────────────────────────────────────────────────────
-- Expected by: admin.service (hospital_id, bed_number, ward, type, status)

CREATE TABLE IF NOT EXISTS beds (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    bed_number  TEXT NOT NULL,
    ward        TEXT NOT NULL,
    type        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Available',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beds ADD COLUMN IF NOT EXISTS ward       TEXT;
ALTER TABLE beds ADD COLUMN IF NOT EXISTS bed_number TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'beds_type_check' AND conrelid = 'beds'::regclass) THEN
        ALTER TABLE beds ADD CONSTRAINT beds_type_check   CHECK (type IN ('ICU', 'General', 'Isolation'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'beds_status_check' AND conrelid = 'beds'::regclass) THEN
        ALTER TABLE beds ADD CONSTRAINT beds_status_check CHECK (status IN ('Available', 'Occupied', 'Reserved', 'Maintenance'));
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 6. APPOINTMENTS ─────────────────────────────────────────────────
-- Expected by: doctor.service, admin.service, patient.service
-- (hospital_id, doctor_id, patient_id, symptoms, triage, status, scheduled_at)

CREATE TABLE IF NOT EXISTS appointments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id    UUID REFERENCES doctors(id) ON DELETE SET NULL,
    patient_id   UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT,
    symptoms     TEXT,
    triage       TEXT NOT NULL DEFAULT 'LOW',
    status       TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all expected columns exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_id   UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS symptoms     TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS triage       TEXT NOT NULL DEFAULT 'LOW';

-- Fix patient_id FK to point at patients table (re-add safely)
DO $$
BEGIN
    -- Try adding the FK; skip if already exists or column type mismatch
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'appointments_patient_id_fkey'
          AND table_name = 'appointments'
    ) THEN
        ALTER TABLE appointments
            ADD CONSTRAINT appointments_patient_id_fkey
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'appointments_patient_id_fkey: %', SQLERRM;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_triage_check' AND conrelid = 'appointments'::regclass) THEN
        ALTER TABLE appointments ADD CONSTRAINT appointments_triage_check
            CHECK (triage IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_status_check' AND conrelid = 'appointments'::regclass) THEN
        ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
            CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 7. PRESCRIPTIONS ────────────────────────────────────────────────
-- Expected by: doctor.service (appointment_id, doctor_id, hospital_id,
--   diagnosis, medications, notes, follow_up_required, draft_status)
-- Expected by: patient.service (join via appointments.patient_id)

CREATE TABLE IF NOT EXISTS prescriptions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id        UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id          UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_id     UUID REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis          TEXT,
    notes              TEXT,
    medications        TEXT,
    follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    draft_status       TEXT NOT NULL DEFAULT 'final',
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS diagnosis          TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS notes              TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medications        TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS draft_status       TEXT NOT NULL DEFAULT 'final';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prescriptions_draft_status_check' AND conrelid = 'prescriptions'::regclass) THEN
        ALTER TABLE prescriptions ADD CONSTRAINT prescriptions_draft_status_check
            CHECK (draft_status IN ('draft', 'final'));
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── 8. HOSPITAL SETTINGS ────────────────────────────────────────────
-- Expected by: admin.service (hospital_id, hospital_name, timezone,
--   notifications_enabled, surge_alert_threshold, updated_at)

CREATE TABLE IF NOT EXISTS hospital_settings (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id            UUID UNIQUE REFERENCES hospitals(id) ON DELETE CASCADE,
    hospital_name          TEXT,
    timezone               TEXT DEFAULT 'Asia/Kolkata',
    notifications_enabled  BOOLEAN DEFAULT TRUE,
    surge_alert_threshold  INTEGER DEFAULT 80,
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS hospital_name         TEXT;
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS timezone              TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS surge_alert_threshold INTEGER DEFAULT 80;
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ DEFAULT NOW();

-- ─── 9. INDEXES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_hospital_id        ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid       ON users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id      ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id          ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_beds_hospital_id         ON beds(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id   ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id  ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled   ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_hospital   ON prescriptions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor     ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appt       ON prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id         ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id     ON patients(hospital_id);

-- ─── 10. ROW LEVEL SECURITY ──────────────────────────────────────────
-- Backend uses service_role key → bypasses RLS automatically.
-- RLS below protects direct client access only.

ALTER TABLE hospitals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds              ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_settings ENABLE ROW LEVEL SECURITY;

-- Helper: resolve hospital_id for the current Supabase auth user
CREATE OR REPLACE FUNCTION get_my_hospital_id() RETURNS UUID AS $$
    SELECT hospital_id FROM users WHERE supabase_uid = auth.uid()::text LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Drop and recreate policies idempotently
DROP POLICY IF EXISTS hospital_isolation ON hospitals;
DROP POLICY IF EXISTS hospital_isolation ON users;
DROP POLICY IF EXISTS hospital_isolation ON doctors;
DROP POLICY IF EXISTS hospital_isolation ON patients;
DROP POLICY IF EXISTS hospital_isolation ON beds;
DROP POLICY IF EXISTS hospital_isolation ON appointments;
DROP POLICY IF EXISTS hospital_isolation ON prescriptions;
DROP POLICY IF EXISTS hospital_isolation ON hospital_settings;

CREATE POLICY hospital_isolation ON hospitals         FOR ALL USING (id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON users             FOR ALL USING (hospital_id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON doctors           FOR ALL USING (hospital_id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON patients          FOR ALL USING (hospital_id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON beds              FOR ALL USING (hospital_id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON appointments      FOR ALL USING (hospital_id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON prescriptions     FOR ALL USING (hospital_id = get_my_hospital_id());
CREATE POLICY hospital_isolation ON hospital_settings FOR ALL USING (hospital_id = get_my_hospital_id());

-- ─── 11. UNIQUE CONSTRAINTS ──────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_user_id_unique' AND conrelid = 'doctors'::regclass) THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- =====================================================================
-- END OF MIGRATION (v3)
-- =====================================================================
-- Tables aligned with backend contract:
--   users         → supabase_uid, email, full_name, role, hospital_id, status
--   doctors       → user_id, hospital_id, specialization, availability_status
--   patients      → user_id, hospital_id, date_of_birth, blood_type
--   beds          → hospital_id, bed_number, ward, type, status
--   appointments  → hospital_id, doctor_id, patient_id, symptoms, triage, status, scheduled_at
--   prescriptions → hospital_id, doctor_id, appointment_id, diagnosis, medications, notes,
--                   follow_up_required, draft_status
--   hospital_settings → hospital_id, hospital_name, timezone, notifications_enabled,
--                       surge_alert_threshold, surge_mode, updated_at
-- =====================================================================

-- =====================================================================
-- v4: Operational Intelligence Columns
-- Apply after v3 base migration. All idempotent.
-- =====================================================================

-- ─── hospital_settings: Surge mode flag ──────────────────────────────
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS surge_mode BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── appointments: Operational state tracking ─────────────────────────
-- bed_required: auto-set TRUE for CRITICAL triage
-- outcome: set by doctor after completion (discharged/follow_up/admitted)
-- started_at: when doctor moved to in_progress
-- completed_at: when doctor marked completed
-- bed_id: FK to beds if a bed was allocated for this appointment
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS bed_required  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS outcome       TEXT CHECK (outcome IN ('discharged', 'follow_up', 'admitted'));
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS started_at    TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at  TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS bed_id        UUID;

-- Add FK to beds if not already referencing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'appointments_bed_id_fkey'
          AND table_name = 'appointments'
    ) THEN
        ALTER TABLE appointments
            ADD CONSTRAINT appointments_bed_id_fkey
            FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'appointments_bed_id_fkey: %', SQLERRM;
END $$;

-- ─── beds: Track which appointment a bed is allocated to ─────────────
ALTER TABLE beds ADD COLUMN IF NOT EXISTS appointment_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'beds_appointment_id_fkey'
          AND table_name = 'beds'
    ) THEN
        ALTER TABLE beds
            ADD CONSTRAINT beds_appointment_id_fkey
            FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'beds_appointment_id_fkey: %', SQLERRM;
END $$;

-- ─── Performance indexes for new columns ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_triage      ON appointments(triage);
CREATE INDEX IF NOT EXISTS idx_appointments_outcome     ON appointments(outcome);
CREATE INDEX IF NOT EXISTS idx_appointments_bed_req     ON appointments(bed_required) WHERE bed_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_hospital_settings_surge  ON hospital_settings(surge_mode) WHERE surge_mode = TRUE;

-- =====================================================================
-- v4 COMPLETE
-- New columns:
--   hospital_settings.surge_mode          → BOOLEAN, admin-controlled
--   appointments.bed_required             → BOOLEAN, auto-set for CRITICAL
--   appointments.outcome                  → TEXT (discharged/follow_up/admitted)
--   appointments.started_at               → TIMESTAMPTZ, set on in_progress
--   appointments.completed_at             → TIMESTAMPTZ, set on completed
--   appointments.bed_id                   → UUID FK to beds
--   beds.appointment_id                   → UUID FK to appointments
-- =====================================================================

-- =====================================================================
-- v5: Bed Lock Rule — waiting_for_bed status, waiting_since column
-- Enables the Rule D enforcement: when CRITICAL patient needs ICU bed
-- but none is free, status becomes waiting_for_bed instead of dropping.
-- Apply AFTER v3 + v4.
-- =====================================================================

-- Step 1: Drop existing status constraint (it doesn't include waiting_for_bed)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Step 2: Re-add with the two new terminal states
ALTER TABLE appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (status IN (
        'scheduled',
        'in_progress',
        'completed',
        'cancelled',
        'waiting_for_bed',   -- Rule D: patient needs ICU but none free
        'admitted'           -- Rule D: bed successfully allocated
    ));

-- Step 3: Track when patient entered the bed-wait queue
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS waiting_since TIMESTAMPTZ;

-- Step 4: Index for fast lookup of patients waiting for beds
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_waiting ON appointments(waiting_since)
    WHERE status = 'waiting_for_bed';

-- =====================================================================
-- v5 COMPLETE
-- New status values: waiting_for_bed, admitted
-- New column: appointments.waiting_since TIMESTAMPTZ
--
-- =====================================================================
-- v5 COMPLETE
-- New status values: waiting_for_bed, admitted
-- New column: appointments.waiting_since TIMESTAMPTZ
-- =====================================================================

-- =====================================================================
-- v6: Live Operational Engine & Metrics Table
-- Adds persistence for real-time metrics and hard booking modes.
-- =====================================================================

-- 1. Hospital Settings: Hard Booking Mode
-- NORMAL: Standard operation.
-- RESTRICTED: Blocking LOW triage, filtering MEDIUM triage.
-- SURGE: All elective blocked, strict critical prioritization.
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS booking_mode TEXT 
    CHECK (booking_mode IN ('NORMAL', 'RESTRICTED', 'SURGE')) DEFAULT 'NORMAL';

-- 2. Metrics Table: Real-time Persistence
-- This table is updated on every relevant mutation (appointment, bed, status).
-- Admin dashboard reads from here to avoid heavy aggregation on every load.
CREATE TABLE IF NOT EXISTS hospital_metrics (
    hospital_id             UUID PRIMARY KEY REFERENCES hospitals(id) ON DELETE CASCADE,
    active_appointments     INTEGER DEFAULT 0,
    waiting_patients        INTEGER DEFAULT 0,
    arrival_rate_30m        DECIMAL(10,2) DEFAULT 0.00,
    completion_rate_30m     DECIMAL(10,2) DEFAULT 0.00,
    hospital_load_pct       INTEGER DEFAULT 0,
    icu_occupancy_pct       INTEGER DEFAULT 0,
    general_occupancy_pct   INTEGER DEFAULT 0,
    avg_wait_time_mins      INTEGER DEFAULT 0,
    critical_waiting_count  INTEGER DEFAULT 0,
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for metrics
ALTER TABLE hospital_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hospital_isolation ON hospital_metrics;
CREATE POLICY hospital_isolation ON hospital_metrics FOR ALL USING (hospital_id = get_my_hospital_id());

-- 3. Performance Indexes for Rate Calculations
-- Crucial for arrival/completion rate window queries.
CREATE INDEX IF NOT EXISTS idx_appointments_created_at  ON appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_started_at  ON appointments(started_at) WHERE started_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_completed_at ON appointments(completed_at) WHERE completed_at IS NOT NULL;

-- =====================================================================
-- v7: Action-Driven Control — Transactional Beds & Doctor Capacity
-- Moves from passive metrics to strict state-transition enforcement.
-- =====================================================================

-- 1. Doctor Capacity Rule
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS max_active_cases INTEGER DEFAULT 5;

-- 2. Stricter Bed Management
-- Add Maintenance status and direct patient linkage
ALTER TABLE beds DROP CONSTRAINT IF EXISTS beds_status_check;
ALTER TABLE beds ADD CONSTRAINT beds_status_check CHECK (status IN ('Available', 'Occupied', 'Maintenance'));
ALTER TABLE beds ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMPTZ DEFAULT NOW();

-- 3. Hospital Operational Toggle
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT TRUE;

-- 4. Transactional Bed Allocation Logic (The Core Control)
-- This Postgres function ensures we lock a bed row FOR UPDATE, 
-- preventing race conditions where two doctors admit into the same bed.
CREATE OR REPLACE FUNCTION allocate_bed_transaction(
    p_hospital_id   UUID,
    p_appt_id       UUID,
    p_bed_type      TEXT
) RETURNS TABLE (id UUID, type TEXT, status TEXT) AS $$
DECLARE
    v_bed_id UUID;
BEGIN
    -- 1. Find and lock the first available bed of the required type
    SELECT b.id INTO v_bed_id
    FROM beds b
    WHERE b.hospital_id = p_hospital_id
      AND b.type = p_bed_type
      AND b.status = 'Available'
    ORDER BY b.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    -- 2. If bed found, perform atomic update
    IF v_bed_id IS NOT NULL THEN
        UPDATE beds SET 
            status = 'Occupied',
            appointment_id = p_appt_id,
            last_status_change = NOW()
        WHERE beds.id = v_bed_id;

        UPDATE appointments SET 
            status = 'admitted',
            bed_id = v_bed_id,
            outcome = 'admitted'
        WHERE appointments.id = p_appt_id;

        RETURN QUERY SELECT beds.id, beds.type, beds.status FROM beds WHERE beds.id = v_bed_id;
    ELSE
        -- Fallback: appointment remains 'waiting_for_bed'
        UPDATE appointments SET 
            status = 'waiting_for_bed',
            waiting_since = NOW(),
            outcome = 'admitted'
        WHERE appointments.id = p_appt_id;
        
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- v7 COMPLETE
-- Added: doctors.max_active_cases
-- Added: hospital_settings.booking_enabled
-- Added: allocate_bed_transaction (Postgres RPC)
-- =====================================================================




