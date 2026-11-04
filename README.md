# CarePulse – Hospital Management System (HMS) & Drug Safety Engine
**A Complete Database Management System (DBMS) Project**

CarePulse is an enterprise-grade Hospital Management System built with a **React (Vite) frontend**, an **Express.js backend**, and a **locally hosted MySQL 8.0 relational database**.

It features strict **Role-Based Access Control (RBAC)** across 4 clinical roles, electronic health record (EHR) timeline management, appointment concurrency guards, and an automated **Clinical Decision Support Drug Safety Engine** that detects adverse drug-drug interactions and patient allergy collisions in real time.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (Client - Port 3000)          │
│   React (Vite) + Tailwind CSS + Lucide Icons             │
│   • AuthContext with JWT Token Management                │
│   • Role-Protected Routes (/doctor, /nurse, /admin, etc.)│
│   • Live Drug Safety Alert Dialog                        │
└────────────────────────────▲─────────────────────────────┘
                             │ HTTP REST (JSON)
                             │ Authorization: Bearer <JWT>
┌────────────────────────────▼─────────────────────────────┐
│                   BACKEND (Server - Port 5000)           │
│   Node.js with Express.js                                │
│   • Middleware: verifyToken & requireRole() guards       │
│   • Controllers & Business Services                      │
│   • Drug Safety Engine & Audit Trail                     │
└────────────────────────────▲─────────────────────────────┘
                             │ Parameterized TCP (Port 3306)
┌────────────────────────────▼─────────────────────────────┐
│              DATABASE (Local MySQL 8.0 / InnoDB)         │
│   hospital_db: 14 Normalized Tables                      │
│   • Primary Keys, Foreign Keys, Cascades, Indexes        │
│   • CHECK constraint: chk_drug_order                     │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix

Security is enforced **at the backend API level**, so unauthorized requests receive `403 Forbidden` even if frontend controls are bypassed:

| Feature / Operation | Doctor | Nurse | Receptionist | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Login & Identity** | Yes | Yes | Yes | Yes |
| **Register / Update Patient Demographics** | View | View | **Full (Create/Update)** | Full |
| **Schedule / Cancel Appointments** | View Own | View All | **Full (Create/Cancel)** | Full |
| **Record Patient Vitals (BP, Pulse, Temp, SpO2)** | View/Add | **Full Responsibility** | No Access | View |
| **Document Clinical Diagnoses** | **Doctor Only** | Read-Only | No Access | No Access |
| **Prescribe Medication** | **Doctor Only** | Read-Only | No Access | No Access |
| **Deactivate / Discontinue Prescription** | **Doctor Only** | No Access | No Access | No Access |
| **Adverse Drug-Drug Conflict Alerts** | Live Check | View Catalog | View Catalog | View Catalog |
| **Manage Staff Accounts & Credentials** | No Access | No Access | No Access | **Admin Only** |
| **View System Audit Logs** | No Access | No Access | No Access | **Admin Only** |

---

## 3. Relational Schema Summary (14 Tables)

1. **`users`**: Login credentials (`username`, `email`, `password_hash` via bcrypt, `role`, `is_active`).
2. **`departments`**: Clinical divisions (Cardiology, Pediatrics, General Medicine, Orthopedics, Trauma).
3. **`staff_profiles`**: 1:1 extension of users for doctors, nurses, receptionists (`specialization`, `license_number`).
4. **`patients`**: Demographics and unique Medical Record Number (`mrn`, `date_of_birth`, `gender`, `blood_group`).
5. **`allergies`**: Documented patient hypersensitivities (`allergen`, `reaction`, `severity`).
6. **`appointments`**: Consultation schedule with concurrency lock preventing doctor double-booking.
7. **`patient_vitals`**: Hemodynamic triage data logged by nurses (`systolic_bp`, `diastolic_bp`, `heart_rate`, `temperature_celsius`, `oxygen_saturation`).
8. **`medical_records`**: Doctor clinical notes (`diagnosis_title`, `symptoms`, `physical_examination`, `treatment_plan`).
9. **`medicines`**: Pharmaceutical catalog (`name`, `generic_name`, `category`, `dosage_form`, `strength`).
10. **`drug_interactions`**: Adverse pairwise interaction engine with check constraint `CHECK (medicine_id_1 < medicine_id_2)`.
11. **`prescriptions`**: Master prescription record with soft-delete flag (`is_active`).
12. **`prescription_medicines`**: Junction table resolving M:N relationship between prescriptions and medicines (`dosage`, `frequency`, `duration`).
13. **`medical_reports`**: Diagnostic tests and scans (`report_title`, `report_type`, `file_url`).
14. **`audit_logs`**: Cryptographic-style non-repudiation audit trail of all sensitive operations.

---

## 4. Pre-Configured Demo Credentials (All Roles)

Password for **all** default demo users is: `password123`

| Role | Username | Staff Member | Focus Area |
| :--- | :--- | :--- | :--- |
| **Doctor** | `dr.sharma` | Dr. Rajesh Sharma | Prescribing, clinical diagnosis, drug interaction safety |
| **Nurse** | `nurse.mary` | Nurse Mary Joseph | Triage vitals entry, read-only prescription care plans |
| **Receptionist** | `reception.rahul` | Rahul Verma | Patient intake, appointment booking & queue coordination |
| **Administrator** | `admin` | System Admin | Staff provisioning, user status toggle, security audit trail |

*(The login page also provides **One-Click Quick Switch buttons** to instantly log in as any role during presentations).*

---

## 5. How to Run Locally

### Option A: One-Click Start (Recommended)
Double-click `start_all.bat` in the project root. It will:
1. Launch the Express backend on `http://localhost:5000`
2. Launch the Vite frontend dev server on `http://localhost:3000`
3. Automatically open `http://localhost:3000` in your default web browser!

### Option B: Manual Terminal Execution

**1. Start the Backend:**
```powershell
cd backend
npm start
# Server starts at http://localhost:5000
```

**2. Start the Frontend:**
```powershell
cd frontend
npm run dev
# Vite server starts at http://localhost:3000
```

### Option C: Reset / Re-seed Database Anytime
Double-click `database/reset_db.bat` or run:
```powershell
Get-Content -Raw "database/schema.sql" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p123456789
Get-Content -Raw "database/seed.sql" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p123456789
```

---

## 6. Viva & Academic Defense Talking Points

When presenting this project to your examiners, highlight these key engineering decisions:

1. **Why MySQL 8.0 with InnoDB?**
   - InnoDB guarantees ACID compliance (Atomicity, Consistency, Isolation, Durability).
   - Foreign key constraints with `ON DELETE CASCADE` and `ON DELETE RESTRICT` protect data integrity.
   - Strict `CHECK` constraint enforcement on `drug_interactions (medicine_id_1 < medicine_id_2)` avoids duplicate symmetric pairs `(A, B)` and `(B, A)`.

2. **How is RBAC enforced securely?**
   - Authentication uses JSON Web Tokens (JWT) signed with a server secret.
   - Passwords are encrypted with `bcrypt` (10 salt rounds).
   - Middleware `verifyToken` decodes the token and `authorizeRoles(...)` intercepts unauthorized API calls, returning `403 Forbidden` before any controller or database code runs.

3. **How does the Drug Safety Engine work?**
   - Generates all unique combinations of prescribed drug IDs `(min_id, max_id)`.
   - Executes a single indexed query against `drug_interactions`.
   - Cross-references the patient's recorded allergies against the generic drug class and name.
   - If a major or contraindicated conflict exists, the backend halts the transaction with `HTTP 409 Safety Warning` unless an authorized physician override is explicitly submitted.

4. **Why Soft Deletes for Prescriptions?**
   - In medical systems, deleting prescription history violates legal compliance and causes foreign key cascade errors. We use `is_active = FALSE` to preserve complete audit trails while preventing further dispensations.
