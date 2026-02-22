<div align="center">

🏥 Real-Time Multi-Tenant Hospital SaaS

Doctor & Admin Backend Operations Engine

A production-structured, real-time, multi-tenant hospital management backend built using modern SaaS architecture principles.

</div>

🚀 Overview

This project is a real-time hospital SaaS platform designed for high-stakes, high-volume healthcare environments. It focuses on delivering absolute data integrity, instant synchronization, and strict tenant isolation.

👨‍⚕️ Doctor Dashboard Backend

🧑‍💼 Admin Dashboard Backend

⚡ Real-time data synchronization

🔐 Multi-tenant secure isolation

🧠 Intelligent queue management

📊 Operational analytics

💡 Pitch-Ready Technical Summary (For Judges & Investors)

"This is not just another CRUD app. It is a mission-critical operations engine."

We built a fully isolated, multi-tenant architecture utilizing PostgreSQL Row-Level Security (RLS) to ensure zero data bleed between hospitals. Instead of relying on manual refreshes or expensive polling, the platform utilizes Supabase Realtime (Postgres WAL) to broadcast state changes instantly to frontend clients.

Race conditions in patient assignment are eliminated via atomic database transactions, ensuring that when two doctors click "Admit" simultaneously, the system flawlessly resolves the conflict at the database level. Authentication is completely decoupled from authorization—relying on Clerk for identity, while the backend rigorously enforces role and tenant boundaries via secure server-side context.

🏗 Architecture & Separation Rules

This repository contains fully separated frontend and backend folders, enforcing strict architectural boundaries.

📂 Folder Structure

/
├── frontend/                  # Client-side presentation & real-time listeners
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages | app/
│   └── package.json
│
└── backend/                   # Secure business logic & database transactions
    ├── api/
    │   ├── doctor/
    │   ├── admin/
    │   └── auth/
    ├── services/
    ├── db/
    │   ├── schema/
    │   ├── migrations/
    │   ├── policies/
    │   └── indexes/
    ├── utils/
    └── package.json


🗺 System Flow Diagram

 ┌─────────────────┐       Live Subscriptions (WAL)       ┌─────────────────┐
 │                 │ <==================================> │                 │
 │ Frontend Client │                                      │ Supabase (DB)   │
 │   (Next.js UI)  │        Secure REST API Calls         │ (PostgreSQL +   │
 │                 │ ───────────────────────────────────> │   Realtime)     │
 └────────┬────────┘                                      └────────▲────────┘
          │                                                        │
    Auth Token Verification                                 Atomic Transactions
          │                                                   RLS Enforcement
          v                                                        │
 ┌─────────────────┐                                      ┌────────┴────────┐
 │                 │         Role/Tenant Validation       │                 │
 │  Clerk Auth     │ <──────────────────────────────────> │ Next.js Backend │
 │                 │                                      │  (API Routes)   │
 └─────────────────┘                                      └─────────────────┘


🔒 Separation Rules

Frontend Responsibilities

Backend Responsibilities

UI rendering & state management

Pure business logic & validation

Realtime subscription listeners

Database write operations

No service keys present

Holds the Service Role Key

No client-side role validation

Server-side authentication & authz validation

🧠 Core System Design

🏥 Multi-Tenant Model

Every core table includes a mandatory hospital_id UUID NOT NULL column.

Row-Level Security (RLS) ensures:

Hospital A cannot access Hospital B data.

Doctors only see their specific hospital's patients.

Admins only see their hospital's metrics.

Security is enforced at three layers:

Clerk session validation.

Backend role verification (Context injection).

Supabase RLS policies (Database-level enforcement).

⚡ Real-Time Infrastructure

Using Supabase Realtime (listening to Postgres Write-Ahead Logs):

Tables with live subscriptions: patients, beds, equipment, alerts

The Flow: Backend DB Write → Postgres WAL → Realtime Channel → Frontend UI Update

No polling. No manual refreshes. Fully event-driven.

👨‍⚕️ Doctor Backend Features

1️⃣ Live Patient Queue

Sorted by: severity_score DESC, created_at ASC

Filtered by: hospital_id, status = 'waiting'

2️⃣ Atomic Patient Assignment

Prevents critical race conditions when multiple doctors attempt to admit the same high-priority patient.

UPDATE patients
SET status = 'in_consult',
    assigned_doctor_id = $doctor_id
WHERE id = $patient_id
AND status = 'waiting'
RETURNING *;


If zero rows returned → already assigned. Graceful failure handled.

3️⃣ Consultation Completion

A single transaction-safe operation triggers:

Status update

Bed release

Staff log entry creation

Realtime broadcast

4️⃣ Severity-Based Priority

Effective ordering uses a calculated severity_score + wait_time_boost to prevent patient starvation in the queue.

🧑‍💼 Admin Backend Features

🛏 Bed Occupancy: Calculates occupied / total. Real-time heatmap compatible, indexed tightly on hospital_id.

👨‍⚕️ Staff Utilization: Computed using SUM(consult_duration) / SUM(shift_duration). Optimized with indexed staff logs.

🧰 Equipment Usage: Tracks in_use count vs. availability with hospital-level aggregation.

🚨 Surge Detection: Lightweight conditional logic (waiting_patients > available_doctors * 5). If triggered, inserts into alerts and broadcasts a realtime notification. No cron required.

🗄 Database & Performance

Core Tables

hospitals | users | doctors | patients | beds | equipment | staff_logs | alerts

(All tables except hospitals contain hospital_id UUID NOT NULL)

📈 Performance Optimizations

Strict Indexing: Created on hospital_id, status, severity_score, created_at, assigned_doctor_id.

Query Optimization: No SELECT *. Minimal column projection.

Safety: No N+1 queries. Heavy utilization of atomic updates and transactional safety.

🧪 Edge Cases Handled

Scenario
Protection Mechanism
Two doctors assign same patient
SQL Atomic update (RETURNING check)
Doctor disconnects mid-consult
Heartbeat / Status check logic
Realtime reconnect
Built-in resubscribe logic on frontend
Surge alert spam
Deduplication / Cool-down windows
Empty queue
Graceful fallback UI states

🧰 Setup Instructions

1️⃣ Backend Setup
```bash
cd backend
npm install
```

Environment variables (.env.local):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
CLERK_SECRET_KEY=your_clerk_secret
```

Run migrations from: /backend/db/migrations

2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Environment variables (.env.local):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable
```

🏆 Why This Architecture Works

✔ Multi-tenant safe: Zero data bleed across organizations.
✔ Realtime scalable: Event-driven UI without database polling strain.
✔ Backend/frontend separation: Clean boundaries for scaling teams.
✔ Race-condition protected: Atomic SQL updates handle concurrency natively.
✔ Hackathon deployable: Fast to stand up, robust to demo.
✔ SaaS-ready foundation: Ready for billing and compliance scaling.

📌 Production Upgrade Roadmap

[ ] Detailed Audit Logging\
[ ] Distributed Caching (Redis) for high-read endpoints
[ ] Horizontal Scaling & Load Balancing
[ ] Stripe Billing Integration
[ ] HIPAA/GDPR Compliance Layer
Released under the MIT License.

This project is structured for clarity and scalability. Pull requests should respect folder separation, the security model, RLS enforcement, and the atomic update pattern.

<div align="center">
<b><i>If you're reading this on GitHub — you're looking at a production-structured backend built in hackathon time. And yes, it’s engineered properly.</i></b>
</div>
