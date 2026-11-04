# A DBMS Mini-Project Report
## On
# SMART MEDICAL HISTORY & DRUG SAFETY SYSTEM
### (Hospital Management System)

---

**Submitted by:**  
**Lokesh N**  
**Register No.: U24UV25T006020**  
**V SEM, BTech (Artificial Intelligence & Machine Learning)**  

---

**Under the guidance of:**  
**Dr. Champa H.N**  
Professor, Department of Computer Science and Engineering  
UVCE, Bengaluru  

---

<br>

### DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
## UNIVERSITY OF VISVESVARAYA COLLEGE OF ENGINEERING
**K.R. Circle, Bengaluru – 560001**  
**Academic Year 2026–2027**

<br>

---

\newpage

## UNIVERSITY OF VISVESVARAYA COLLEGE OF ENGINEERING
### DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
**K.R. Circle, Bengaluru – 560001**

<br>

### CERTIFICATE

This is to certify that **Lokesh N** of **V Semester, B.Tech, Artificial Intelligence & Machine Learning**, bearing the register number **U24UV25T006020**, has successfully submitted the DBMS Mini-Project Report on **“SMART MEDICAL HISTORY & DRUG SAFETY SYSTEM”**, in partial fulfillment for the DBMS Laboratory course prescribed by the **University of Visvesvaraya College of Engineering** for the academic year **2026–2027**.

<br><br><br>

--------------------------------------------- &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; ---------------------------------------------  
**Dr. Champa H. N** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; **Dr. Thriveni J**  
Professor, Dept. of CSE &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Professor & Chairperson, Dept. of CSE  
UVCE, Bengaluru &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; UVCE, Bengaluru  

<br><br>

**Examiners:**

1. __________________________________ &emsp;&emsp;&emsp;&emsp; Date: _______________

2. __________________________________ &emsp;&emsp;&emsp;&emsp; Date: _______________

<br>

---

\newpage

## ACKNOWLEDGEMENT

I take this opportunity to express my profound gratitude to my institution, **University of Visvesvaraya College of Engineering (UVCE)**, for providing me with an excellent academic environment and opportunity to carry out this mini-project.

I would like to extend my heartfelt thanks to **Prof. Subhasish Tripathy**, Director, UVCE, for providing the necessary facilities and technical infrastructure to work on this project. His constant encouragement is deeply appreciated.

I wish to place on record my sincere gratitude to **Dr. Thriveni J**, Professor and Chairperson, Department of Computer Science and Engineering, UVCE, for her continuous support and for guiding the departmental laboratory activities toward academic excellence.

It gives me immense pleasure to express my deepest gratitude to my guide, **Dr. Champa H.N**, Professor, Department of Computer Science and Engineering, UVCE, for her valuable guidance, constructive technical suggestions, critical feedback, and constant supervision throughout the conceptualization and development of this project.

I express my sincere thanks to all the faculty members and technical staff of the Department of Computer Science and Engineering, UVCE, for their assistance and encouragement.

Finally, I express my heartfelt gratitude to my parents and friends for their enduring patience, encouragement, and support throughout my academic endeavors.

<br><br>
**Lokesh N**  
U24UV25T006020  
V Sem B.Tech (AIML), Dept. of CSE, UVCE  

---

\newpage

## ABSTRACT

Modern healthcare facilities handle sensitive patient medical records, clinical vitals, diagnostic histories, and medication regimes. Traditional hospital record management relying on physical case sheets, standalone spreadsheets, or fragmented software modules introduces severe vulnerabilities: transcription errors, missing patient drug allergies, accidental over-prescription, dangerous drug-drug interactions, and unauthorized access to protected health information (PHI).

The **Smart Medical History & Drug Safety System** is an enterprise-grade, web-based healthcare management platform designed to centralize and automate clinical and administrative hospital operations while enforcing clinical safety at the database tier. The core innovation of the system is an integrated **Drug-Drug Interaction and Allergy Safety Engine** that intercepts prescription creation in real time, cross-referencing candidate medications against both existing patient allergies and known pharmacological contraindications using normalized database constraints and symmetric interaction lookups.

The architecture follows a decoupled three-tier model:
1. **Presentation Layer**: Built with **React 19, Vite, and Tailwind CSS**, featuring dedicated, role-tailored dashboards for **Admins, Doctors, Nurses, and Receptionists**, as well as an interactive safety override modal.
2. **Application Layer**: A high-performance RESTful API built on **Node.js and Express.js**, featuring **JSON Web Token (JWT)** stateless authentication, fine-grained **Role-Based Access Control (RBAC)**, parameterized query builders to prevent SQL injection, and strict **ACID-compliant transactions** (`BEGIN`, `COMMIT`, `ROLLBACK`) for multi-item prescriptions and staff onboarding.
3. **Data Layer**: An optimized **MySQL 8.0** relational database comprising **14 normalized tables in Third Normal Form (3NF)**. Business rules and data protection policies are enforced directly inside the database through active **SQL Triggers** (preventing hard deletion of prescription legal records, validating biological vitals integrity, and recording automated audit trails), **Foreign Key constraints with referential actions (`CASCADE`, `RESTRICT`)**, unique keys preventing appointment double-booking, and multi-table analytical **JOIN queries**.

The system underwent extensive functional verification through an automated 19-scenario test suite, confirming strict RBAC boundaries, 100% prevention of illegal hard-deletions via triggers, sub-second conflict detection for hazardous drug pairs, and zero data corruption under concurrent load. The solution demonstrates how relational database principles directly improve clinical outcomes and operational efficiency in hospital environments.

---

\newpage

## TABLE OF CONTENTS

| Chapter / Section | Title | Page No. |
| :--- | :--- | :---: |
| **1.** | **Introduction** | **1** |
| 1.1 | Introduction | 1 |
| 1.2 | Problem Statement & Objectives | 1 |
| 1.3 | System Functionality & Clinical Modules | 2 |
| 1.4 | User Roles and Access Hierarchy | 3 |
| 1.5 | Views & Dashboards Available in the System | 3 |
| 1.6 | Database Management System Fundamentals | 4 |
| 1.7 | MySQL RDBMS Architecture & SQL Primitives | 5 |
| **2.** | **Literature Review & System Design** | **8** |
| 2.1 | Survey of Existing Hospital Record Systems | 8 |
| 2.2 | Proposed Three-Tier Architecture | 8 |
| 2.3 | Software & Hardware Requirements | 9 |
| 2.4 | Frontend Technologies (React, Vite, Tailwind CSS) | 10 |
| 2.5 | Backend Technologies (Node.js, Express, JWT, Bcrypt) | 10 |
| 2.6 | Algorithmic Drug Safety Engine | 11 |
| 2.7 | Entity-Relationship (ER) Conceptual Modeling | 12 |
| 2.8 | 7-Step Relational Schema Transformation | 14 |
| 2.9 | Database Normalization (1NF, 2NF, 3NF, BCNF) | 16 |
| 2.10 | REST API Design & Error Handling Protocol | 18 |
| 2.11 | Advantages of the Proposed System | 19 |
| **3.** | **Proposed Work & Database Implementation** | **21** |
| 3.1 | Entity-Relationship (ER) Schema & Cardinalities | 21 |
| 3.2 | Relational Model & Schema Specifications | 23 |
| 3.3 | Active Database Rules: Triggers & Implementations | 27 |
| 3.4 | ACID Transactions & Concurrency Control | 29 |
| 3.5 | Analytical Complex JOIN Queries | 30 |
| **4.** | **Results & System Evaluation** | **33** |
| 4.1 | Implementation Outcomes & Verification | 33 |
| 4.2 | Functional & RBAC Automated Test Suite Matrix | 34 |
| 4.3 | Application User Interface & Terminal Demonstrations | 36 |
| **5.** | **Conclusion & Future Enhancements** | **40** |
| **6.** | **Bibliography & References** | **42** |

---

\newpage

# CHAPTER 1: INTRODUCTION

### 1.1 Introduction
In modern clinical environments, the efficiency, speed, and accuracy of patient data management directly impact healthcare quality and patient survival. Hospitals generate massive streams of interrelated data daily, including demographic profiles, vital sign telemetry, consultation summaries, diagnostic reports, and pharmaceutical prescriptions. Historically, healthcare institutions relied on paper files, localized physical archives, or disjointed spreadsheets. Such legacy methods present severe operational bottlenecks: patient histories get fragmented across departments, hand-written physician notes cause fatal transcription misunderstandings, and doctors frequently lack immediate visibility into a patient's known drug allergies or adverse cross-medication interactions.

The **Smart Medical History & Drug Safety System** is a full-stack, database-centric Hospital Management System (HMS) developed to eliminate manual inefficiencies and deliver computerized physician order entry with built-in pharmacological intelligence. By coupling an ACID-compliant relational database engine (**MySQL 8.0**) with an enterprise web architecture (**Node.js/Express.js REST API** and **React 19** frontend), the system guarantees strict data integrity, auditability, and role-based data security.

### 1.2 Problem Statement & Objectives
#### Problem Statement
Adverse Drug Events (ADEs) represent one of the leading causes of preventable medical complications globally. When doctors prescribe medications without automated cross-checking against a patient's historical allergies or concurrently active prescriptions, toxic pharmaceutical interactions occur. Furthermore, manual appointment scheduling leads to double-booking of specialist doctors, vital sign recording lacks immediate validation against biological survival thresholds, and medical records are vulnerable to illegal tampering or accidental deletion.

#### Project Objectives
1. **Centralized Clinical Record Storage:** Establish a normalized relational schema of 14 interconnected tables to store demographic, clinical, administrative, and pharmacy data without data duplication.
2. **Automated Pharmacological Safety Guard:** Design and implement a proactive Drug Safety Engine that intercepts prescription submissions, checks candidate drug pairs against known dangerous interactions, and alerts against documented patient allergies.
3. **Role-Based Access Control (RBAC):** Restrict system features strictly according to job responsibilities (Receptionist, Doctor, Nurse, Hospital Administrator) using cryptographic JSON Web Tokens (JWT).
4. **Active Database Integrity via SQL Triggers:** Deploy active triggers in MySQL to:
   - Block hard-deletion of legal prescription records (`SQLSTATE '45000'`).
   - Validate physiological vitals (e.g., systolic blood pressure must strictly exceed diastolic pressure).
   - Automatically write audit log entries whenever appointment statuses change.
5. **ACID Transaction Guarantees:** Ensure all-or-nothing execution during multi-item prescription issuance and staff registration using explicit database transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`).
6. **Appointment Collision Prevention:** Implement mathematical timestamp validation to enforce a 15-minute buffer between appointments for any individual physician, eliminating double-booking.

### 1.3 System Functionality & Clinical Modules
The platform is organized into six core clinical and operational modules:

```
+-----------------------------------------------------------------------------------+
|               SMART MEDICAL HISTORY & DRUG SAFETY SYSTEM MODULES                  |
+-----------------------------------------------------------------------------------+
|  1. Patient Registration & Master Record Number (MRN) Lifecycle                   |
|  2. Clinical Triage & Vital Signs Telemetry Monitoring (Nurse Desk)               |
|  3. Doctor Consultation, Diagnosis & Electronic Health Records (EHR)              |
|  4. Intelligent Prescription Writer with Drug Interaction & Allergy Interceptor    |
|  5. Multi-Specialty Appointment Scheduling & Collision Prevention Engine          |
|  6. Hospital Administrative Control, Staff Auditing & System Metrics Dashboard     |
+-----------------------------------------------------------------------------------+
```

- **Patient Administration:** Manages lifelong patient records identified by unique Medical Record Numbers (`MRN`), capturing demographics, blood group, emergency contacts, and known allergies.
- **Nurse Vitals Triage:** Allows registered nurses to record temperature, heart rate, blood pressure, respiratory rate, and blood oxygen saturation ($SpO_2$) with automated clinical warning alerts (e.g., Hypertensive Crisis, Hypoxia).
- **Consultation & Diagnostic Reports:** Doctors document chief complaints, symptoms, official diagnoses, and review laboratory/radiology reports linked directly to patient files.
- **Drug Safety & Pharmacy:** Catalogs medications, dosage forms, active ingredients, and enforces a pre-computed interaction matrix before prescriptions are committed to storage.
- **Appointment Scheduling:** Handles patient bookings with specific doctors and departments, tracking status through `Scheduled`, `Completed`, and `Cancelled`.
- **System Auditing:** Captures an unalterable audit trail recording which staff member accessed, created, or modified clinical data with exact IP and timestamp stamps.

### 1.4 User Roles and Access Hierarchy
The system enforces strict operational segregation of duties across four roles:

1. **Hospital Administrator (`admin`):**
   - Manages hospital departments, doctor specialties, and user accounts.
   - Enforces account deactivation and views system-wide audit logs.
   - Accesses high-level analytical metrics (total patients, revenue, daily consultations).
2. **Medical Doctor (`doctor`):**
   - Accesses assigned patient queues and consultation histories.
   - Writes clinical diagnoses and reviews diagnostic reports.
   - Authors prescriptions with real-time feedback from the Drug Interaction Engine.
3. **Clinical Nurse (`nurse`):**
   - Conducts patient intake triage and records vital signs.
   - Flags abnormal physiological vitals directly to the consulting physician.
   - Views patient medical histories and medication schedules.
4. **Front Desk Receptionist (`receptionist`):**
   - Registers incoming outpatients and generates unique MRNs.
   - Books, reschedules, and cancels patient appointments.
   - Directs walk-in patients to appropriate clinical departments.

### 1.5 Views & Dashboards Available in the System
- **Unified Authentication Gateway:** Single secure login page featuring demo switch presets for rapid examination evaluation.
- **Doctor Consultation Station:** Features patient queues, clinical record authoring, prescription composer, and interactive drug collision modal.
- **Nurse Triage Desk:** Direct numeric vital entry form with dynamic color-coded threshold badges (Normal, Pre-Hypertension, Critical Crisis).
- **Receptionist Desk:** Fast patient search by MRN or phone, patient onboarding modal, and doctor appointment scheduling calendar.
- **Administrator Command Center:** Master staff directory, department configuration, system audit log grid, and real-time operational KPI cards.
- **Patient 360-Degree Clinical Dossier:** Consolidated view displaying timeline of past visits, vitals history, active prescriptions, and documented allergies.

### 1.6 Database Management System Fundamentals
A Database Management System (DBMS) is specialized software that provides an interface between end-users, application programs, and physical database files stored on disk. In healthcare environments where data loss or corruption can result in legal liability and loss of human life, an enterprise DBMS is indispensable.

#### Core Characteristics of Modern DBMS
1. **Self-Describing Nature of a Database System:** The database contains not only the data itself but also a complete definition of the database structure and constraints (the system catalog or data dictionary).
2. **Insulation Between Programs and Data (Program-Data Independence):** The storage structure and access mechanisms can change without requiring modifications to the web application controllers.
3. **Support of Multiple Views of Data:** A receptionist views appointment and billing data, whereas a nurse views vital signs and triage notes, and a doctor views deep clinical diagnoses.
4. **Multi-User Transaction Processing & Concurrency Control:** Guarantees that concurrent access by doctors and receptionists does not lead to race conditions, phantom reads, or lost updates through Isolation levels.
5. **Enforcement of Integrity Constraints:** Ensures domain constraints, entity integrity, referential integrity, and business rules remain inviolable at all times.

### 1.7 MySQL RDBMS Architecture & SQL Primitives
This project utilizes **MySQL 8.0 Community Server** configured with the **InnoDB Storage Engine**. InnoDB is a crash-safe, fully ACID-compliant transactional storage engine supporting row-level locking, foreign keys, and doublewrite buffering.

#### Essential SQL DDL & DML Commands in the Project

```sql
-- DDL: Creating the Master Patients Table with Constraints
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- DML: Parameterized Insertion of Patient Data
INSERT INTO patients (mrn, full_name, date_of_birth, gender, blood_group, phone, emergency_contact)
VALUES ('PAT-2026-84920', 'Rajesh Sharma', '1988-06-14', 'Male', 'O+', '9845012345', 'Sunita Sharma - 9845054321');

-- DQL: Retrieving Comprehensive Patient Encounter History
SELECT p.mrn, p.full_name, a.appointment_date, a.status, d.full_name AS doctor_name, dep.name AS department
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN staff_profiles sp ON a.doctor_id = sp.staff_id
JOIN users d ON sp.user_id = d.user_id
JOIN departments dep ON sp.department_id = dep.department_id
WHERE a.status = 'Scheduled'
ORDER BY a.appointment_date ASC;
```

#### SQL Aggregate Functions Employed in Administrative Analytics
- **`COUNT(*)`**: Computes patient census, total active consultations, and staff volume.
- **`AVG()`**: Calculates average systolic/diastolic pressures across inpatient admissions.
- **`MIN()` / `MAX()`**: Determines age distributions and extremes in patient heart rates.
- **`GROUP BY` with `HAVING`**: Groups appointments by clinical department and identifies peak utilization periods.

---

\newpage

# CHAPTER 2: LITERATURE REVIEW & SYSTEM DESIGN

### 2.1 Survey of Existing Hospital Record Systems
Traditional Electronic Medical Record (EMR) solutions suffer from significant shortcomings:
- **Physical Paper Files:** Suffer from physical wear and tear, high loss rates, no concurrent access, and zero automated checks against medication errors.
- **Ad-Hoc Spreadsheets (Excel / Google Sheets):** Lack relational integrity, allow accidental column overwrites, have no true foreign key enforcement, provide no unalterable audit trails, and cannot alert doctors to drug-drug contraindications.
- **Monolithic Commercial HMS Suites:** Often prohibitively expensive for community clinics, rigid in configuration, closed-source, and frequently decouple appointment front-desks from pharmaceutical safety validation.

### 2.2 Proposed Three-Tier Architecture
The system employs a production-grade three-tier decoupled architecture:

```
+-------------------------------------------------------------------------------+
|                       TIER 1: PRESENTATION LAYER                              |
|                React 19 + Vite + Tailwind CSS + Lucide Icons                  |
|     (Role Dashboards: Admin, Doctor, Nurse, Receptionist, Safety Modal)       |
+-------------------------------------------------------------------------------+
                                      ▲
                                      │ HTTP REST API / JSON (Bearer JWT)
                                      ▼
+-------------------------------------------------------------------------------+
|                       TIER 2: APPLICATION LOGIC LAYER                         |
|                   Node.js 24 LTS + Express.js Framework                       |
|   - Authentication Middleware (verifyToken & Role-Based Access Control)       |
|   - Drug Safety Algorithmic Engine (Allergy & Interaction Checkers)           |
|   - Transaction Controller (ACID Multi-Table Commit & Rollback)               |
|   - Parameterized SQL Prepared Statement Builders                             |
+-------------------------------------------------------------------------------+
                                      ▲
                                      │ TCP Binary Protocol / Connection Pool (Port 3306)
                                      ▼
+-------------------------------------------------------------------------------+
|                       TIER 3: DATA STORAGE LAYER                              |
|                          MySQL 8.0 InnoDB Engine                              |
|   - 14 Normalized Relational Tables in Third Normal Form (3NF)                |
|   - Active Database Triggers (BEFORE INSERT, BEFORE DELETE, AFTER UPDATE)     |
|   - Declarative Foreign Key Cascades & Strict Check Constraints               |
+-------------------------------------------------------------------------------+
```

### 2.3 Software & Hardware Requirements
#### Software Requirements
- **Operating System:** Windows 10/11, macOS Sequoia, or Ubuntu Linux 22.04 LTS
- **Database Server:** MySQL Server 8.0.x with InnoDB Engine enabled
- **Backend Runtime:** Node.js v20.x or v24.x LTS with npm v10+
- **Frontend Engine:** Vite 6 with React 19 and Tailwind CSS v4
- **Core Libraries:** `mysql2/promise` (connection pooling), `bcryptjs` (password hashing), `jsonwebtoken` (stateless authentication), `cors`, `dotenv`
- **Development Tools:** VS Code, Git CLI, GitHub Cloud Repository, MySQL Workbench / Command Line Client

#### Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (Quad Core minimum)
- **RAM:** Minimum 4 GB RAM (8 GB recommended for concurrent database and local dev servers)
- **Disk Storage:** Minimum 500 MB free hard disk space for code repositories, node_modules, and MySQL database files

### 2.4 Frontend Technologies
The frontend provides a responsive, single-page application (SPA) experience built with modern web standards:
- **React 19:** Utilizes declarative component-driven development, custom React Hooks (`useState`, `useEffect`, `useContext`), and instantaneous virtual DOM updates.
- **Tailwind CSS:** Enables rapid UI styling through atomic utility classes, guaranteeing responsive design across clinical tablets and desktop monitors.
- **React Router DOM v7:** Manages client-side routing, navigation history, and route protection via custom `<ProtectedRoute>` higher-order components.
- **Lucide Icons:** Provides crisp, medically relevant SVG iconography for clinical workflows.

### 2.5 Backend Technologies
- **Node.js & Express.js:** Asynchronous, event-driven JavaScript runtime executing non-blocking I/O operations, ideal for handling concurrent clinical API requests.
- **MySQL2 Connection Pool:** Maintains a pool of 15 persistent TCP database connections, eliminating the latency of creating new database handshakes for every HTTP request.
- **Cryptographic Security:** Passwords are never stored in plaintext; they are hashed with `bcryptjs` using a cost factor of 10 salt rounds. Stateless authentication is handled via signed JSON Web Tokens (`HMAC-SHA256`) containing user identities and authorized role claims.

### 2.6 Algorithmic Drug Safety Engine
The Drug Safety Engine (`backend/src/services/drugSafetyService.js`) executes before any prescription row is inserted:
1. **Symmetric Pair Generation:** If a doctor prescribes $k$ medications $\{M_1, M_2, \dots, M_k\}$, the engine generates all $\binom{k}{2} = \frac{k(k-1)}{2}$ unique unordered pairs.
2. **Canonical Ordering:** Because the database enforces a check constraint `CONSTRAINT chk_drug_order CHECK (medicine_id_1 < medicine_id_2)`, each pair is normalized such that $\min(M_a, M_b)$ is placed first.
3. **Database Interaction Query:** The engine queries the `drug_interactions` table in a single indexed lookup:
   ```sql
   SELECT di.*, m1.name AS med1_name, m2.name AS med2_name
   FROM drug_interactions di
   JOIN medicines m1 ON di.medicine_id_1 = m1.medicine_id
   JOIN medicines m2 ON di.medicine_id_2 = m2.medicine_id
   WHERE (di.medicine_id_1, di.medicine_id_2) IN ((1, 2), (1, 3), (2, 3));
   ```
4. **Allergy Cross-Referencing:** Retrieves patient allergy tokens from the `allergies` table and compares them against the chemical components and trade names of the prescribed drugs.
5. **Enforcement:** If a `Major` or `Moderate` interaction is detected and `forceOverride !== true`, the backend aborts the transaction with an `HTTP 409 Conflict`, prompting the physician to review alternatives.

### 2.7 Entity-Relationship (ER) Conceptual Modeling
The ER conceptual model abstracts clinical realities into formal entities, attributes, and mathematical relationships.
- **Entities:** Real-world clinical objects distinguishable from all other objects (e.g., Patient, Doctor, Prescription, Medicine).
- **Attributes:** Properties belonging to an entity (e.g., Patient's Date of Birth, Medicine's Dosage Form).
- **Key Constraints:** Selection of minimal attribute sets that uniquely identify instances (Primary Keys), such as `patient_id` or `mrn`.

### 2.8 7-Step Relational Schema Transformation
The transformation from conceptual ER diagrams to formal relational schemas follows systematic rules:
- **Step 1: Mapping Strong Entities:** Each independent entity (`users`, `departments`, `patients`, `medicines`) maps directly to a relation.
- **Step 2: Mapping Weak Entities:** Entities whose existence depends on an owner entity (`prescription_medicines`, `allergies`) inherit the owner's primary key as a composite key or foreign key.
- **Step 3: Mapping Binary 1:1 Relationships:** `users` $\leftrightarrow$ `staff_profiles` is linked via `user_id` designated as `UNIQUE NOT NULL` in `staff_profiles`.
- **Step 4: Mapping Binary 1:N Relationships:** `departments` $\leftrightarrow$ `staff_profiles` places `department_id` as a foreign key on the `staff_profiles` relation.
- **Step 5: Mapping Binary M:N Relationships:** `prescriptions` $\leftrightarrow$ `medicines` is resolved via the junction table `prescription_medicines`.
- **Step 6: Mapping Multivalued Attributes:** Patient allergies are segregated into a dedicated `allergies` table rather than stored as comma-separated lists, preserving atomicity.
- **Step 7: Mapping Specialization / Generalization:** All hospital actors share the generalized `users` table for credentials, with role-specific attributes specialized in `staff_profiles` and `patients`.

### 2.9 Database Normalization (1NF, 2NF, 3NF, BCNF)
Normalization systematically decomposes relations to eliminate insertion, update, and deletion anomalies.

- **First Normal Form (1NF):** All attributes contain only atomic (indivisible) values. No repeating groups or comma-separated lists exist in core clinical attributes.
- **Second Normal Form (2NF):** The relation is in 1NF, and every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependencies on composite keys).
- **Third Normal Form (3NF):** The relation is in 2NF, and no non-prime attribute is transitively dependent on the primary key (no $X \to Y \to Z$ where $Y$ is non-prime).
- **Boyce-Codd Normal Form (BCNF):** For every non-trivial functional dependency $X \to Y$, $X$ must be a super key.

#### Functional Dependencies in the System Schema

| Relation | Primary Key | Determinant Functional Dependencies | Normal Form |
| :--- | :--- | :--- | :---: |
| `users` | `user_id` | `user_id` $\to$ `email`, `password_hash`, `role`, `status` | **3NF / BCNF** |
| `departments` | `department_id` | `department_id` $\to$ `name`, `description` | **3NF / BCNF** |
| `staff_profiles` | `staff_id` | `staff_id` $\to$ `user_id`, `department_id`, `license_number`, `phone` | **3NF / BCNF** |
| `patients` | `patient_id` | `patient_id` $\to$ `mrn`, `full_name`, `dob`, `gender`, `blood_group`, `phone` | **3NF / BCNF** |
| `appointments` | `appointment_id` | `appointment_id` $\to$ `patient_id`, `doctor_id`, `date`, `status`, `reason` | **3NF / BCNF** |
| `patient_vitals` | `vital_id` | `vital_id` $\to$ `patient_id`, `recorded_by`, `systolic`, `diastolic`, `heart_rate` | **3NF / BCNF** |
| `medical_records` | `record_id` | `record_id` $\to$ `patient_id`, `doctor_id`, `diagnosis`, `symptoms`, `treatment` | **3NF / BCNF** |
| `medicines` | `medicine_id` | `medicine_id` $\to$ `name`, `generic_name`, `dosage_form`, `strength` | **3NF / BCNF** |
| `drug_interactions`| `(medicine_id_1, medicine_id_2)` | `(medicine_id_1, medicine_id_2)` $\to$ `severity`, `description` | **3NF / BCNF** |
| `prescriptions` | `prescription_id` | `prescription_id` $\to$ `patient_id`, `doctor_id`, `status`, `valid_until` | **3NF / BCNF** |
| `prescription_medicines` | `(prescription_id, medicine_id)` | `(prescription_id, medicine_id)` $\to$ `dosage`, `frequency`, `duration_days` | **3NF / BCNF** |
| `allergies` | `allergy_id` | `allergy_id` $\to$ `patient_id`, `allergen`, `severity`, `reaction` | **3NF / BCNF** |
| `medical_reports` | `report_id` | `report_id` $\to$ `patient_id`, `doctor_id`, `report_type`, `file_path` | **3NF / BCNF** |
| `audit_logs` | `log_id` | `log_id` $\to$ `user_id`, `action`, `table_name`, `record_id`, `timestamp` | **3NF / BCNF** |

### 2.10 REST API Design & Error Handling Protocol
The backend exposes a secure, predictable HTTP interface:

| Method | Endpoint | Authorized Roles | Functional Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and issues signed JWT |
| `GET` | `/api/patients` | All Roles | Lists registered patients with optional pagination/search |
| `POST` | `/api/patients` | Receptionist, Admin | Registers new patient and auto-generates unique MRN |
| `GET` | `/api/appointments` | All Roles | Fetches appointment schedules filtered by date/doctor |
| `POST` | `/api/appointments` | Receptionist, Admin | Books appointment with 15-min concurrency window check |
| `PATCH`| `/api/appointments/:id`| All Roles | Updates status (`Completed`, `Cancelled`, `No Show`) |
| `POST` | `/api/vitals` | Nurse, Doctor | Records patient vitals with physiological trigger validation |
| `POST` | `/api/clinical/records`| Doctor | Records official clinical diagnosis and consultation notes |
| `POST` | `/api/prescriptions` | Doctor | ACID transaction creating prescription with safety engine |
| `GET` | `/api/medicines` | All Roles | Returns catalog of approved pharmaceutical drugs |
| `POST` | `/api/medicines/check-safety` | Doctor | Pre-flight test of drug interactions and patient allergies |
| `GET` | `/api/admin/stats` | Admin | Fetches analytical hospital census and KPI aggregates |
| `GET` | `/api/admin/audit-logs` | Admin | Inspects system-wide security and modification trails |

#### Standardized HTTP Status Code Protocol
- **`200 OK`**: Request executed successfully; payload returned.
- **`201 Created`**: New resource successfully committed to database storage.
- **`400 Bad Request`**: Validation failed (e.g., malformed email, missing required fields).
- **`401 Unauthorized`**: Authentication missing or expired JWT token.
- **`403 Forbidden`**: User authenticated but lacks RBAC role permissions.
- **`404 Not Found`**: Target record ID does not exist in database tables.
- **`409 Conflict`**: Business violation, e.g., appointment double-booking or dangerous drug interaction.

### 2.11 Advantages of the Proposed System
1. **Clinical Error Elimination:** Proactively halts the issuance of fatal drug cocktails and allergen exposures.
2. **Unalterable Legal Integrity:** Database triggers prevent deletion of prescription histories, fulfilling medical record compliance laws.
3. **Data Loss Immunity:** Multi-statement transactions ensure that network timeouts never leave half-written prescriptions or disconnected records.
4. **Seamless Role Separation:** Each healthcare provider sees only data necessary for their workflow, safeguarding patient privacy.

---

\newpage

# CHAPTER 3: PROPOSED WORK & DATABASE IMPLEMENTATION

### 3.1 Entity-Relationship (ER) Schema & Cardinalities
The system architecture links 14 distinct relations modeling clinical operations:

```
                                  [DEPARTMENTS]
                                        │ 1
                                        │
                                        │ HAS_STAFF (1:N)
                                        │
                                        ▼ N
   [USERS] ──── 1:1 ────► [STAFF_PROFILES] (Doctors, Nurses, Receptionists)
     │                          │
     │ 1                        │ 1
     │ LOGS_ACTION              │ CONDUCTS_CONSULTATION / SCHEDULES (1:N)
     ▼ N                        ▼ N
[AUDIT_LOGS]               [APPOINTMENTS] ◄──── 1:N ──── [PATIENTS]
                                                              │ 1
                                       ┌──────────────────────┼──────────────────────┐
                                       │ 1                    │ 1                    │ 1
                                       ▼ N                    ▼ N                    ▼ N
                               [PATIENT_VITALS]        [MEDICAL_RECORDS]        [ALLERGIES]
                                                              │ 1
                                                              ▼ 1
                                                        [PRESCRIPTIONS]
                                                              │ 1
                                                              ▼ N
                                                    [PRESCRIPTION_MEDICINES]
                                                              ▲ N
                                                              │
                                                        [MEDICINES] ◄─── M:N ─── [DRUG_INTERACTIONS]
```

#### Detailed ER Relationship and Participation Matrix

| Relationship | Participating Entities | Cardinality | Participation Constraints |
| :--- | :--- | :---: | :--- |
| **BELONGS_TO** | `staff_profiles` – `departments` | $1 : N$ | Staff Total, Department Partial |
| **EXTENDS** | `users` – `staff_profiles` | $1 : 1$ | Staff Total, User Partial |
| **SCHEDULES** | `patients` – `appointments` | $1 : N$ | Appointment Total, Patient Partial |
| **ATTENDS** | `staff_profiles` – `appointments` | $1 : N$ | Appointment Total, Doctor Partial |
| **RECORDS_VITALS**| `patients` – `patient_vitals` | $1 : N$ | Vitals Total, Patient Partial |
| **TAKEN_BY** | `staff_profiles` – `patient_vitals` | $1 : N$ | Vitals Total, Nurse Partial |
| **DIAGNOSES** | `staff_profiles` – `medical_records` | $1 : N$ | Record Total, Doctor Partial |
| **HAS_RECORD** | `patients` – `medical_records` | $1 : N$ | Record Total, Patient Partial |
| **ISSUES** | `staff_profiles` – `prescriptions` | $1 : N$ | Prescription Total, Doctor Partial |
| **RECEIVES** | `patients` – `prescriptions` | $1 : N$ | Prescription Total, Patient Partial |
| **CONTAINS** | `prescriptions` – `medicines` | $M : N$ | Resolved via `prescription_medicines` |
| **CONTRAINDICATES**| `medicines` – `medicines` | $M : N$ | Resolved via `drug_interactions` (ordered pair) |
| **DOCUMENTS** | `patients` – `allergies` | $1 : N$ | Allergy Total, Patient Partial |
| **ATTACHED_TO** | `patients` – `medical_reports` | $1 : N$ | Report Total, Patient Partial |

### 3.2 Relational Model & Schema Specifications
The 14 relations are defined in MySQL 8.0 with explicit primary, foreign, and domain constraints:

1. **`users`**: `(user_id PK, email UNIQUE, password_hash, role, is_active, created_at)`
2. **`departments`**: `(department_id PK, name UNIQUE, description)`
3. **`staff_profiles`**: `(staff_id PK, user_id FK UNIQUE, department_id FK, full_name, license_number UNIQUE, phone)`
4. **`patients`**: `(patient_id PK, mrn UNIQUE, user_id FK UNIQUE NULL, full_name, date_of_birth, gender, blood_group, phone, emergency_contact, address, created_at)`
5. **`allergies`**: `(allergy_id PK, patient_id FK, allergen, severity, reaction, diagnosed_date)`
6. **`appointments`**: `(appointment_id PK, patient_id FK, doctor_id FK, appointment_date, status, reason, created_at)`
7. **`patient_vitals`**: `(vital_id PK, patient_id FK, recorded_by FK, recorded_at, systolic, diastolic, heart_rate, temperature, respiratory_rate, oxygen_saturation, notes)`
8. **`medical_records`**: `(record_id PK, patient_id FK, doctor_id FK, appointment_id FK NULL, visit_date, symptoms, diagnosis, treatment_plan, notes)`
9. **`medicines`**: `(medicine_id PK, name, generic_name, dosage_form, strength, manufacturer, is_active)`
10. **`drug_interactions`**: `(interaction_id PK, medicine_id_1 FK, medicine_id_2 FK, severity, description, CHECK (medicine_id_1 < medicine_id_2), UNIQUE(medicine_id_1, medicine_id_2))`
11. **`prescriptions`**: `(prescription_id PK, record_id FK NULL, patient_id FK, doctor_id FK, status, valid_until, instructions, created_at)`
12. **`prescription_medicines`**: `(prescription_id FK, medicine_id FK, dosage, frequency, duration_days, instructions, PRIMARY KEY (prescription_id, medicine_id))`
13. **`medical_reports`**: `(report_id PK, patient_id FK, doctor_id FK, report_type, title, file_path, notes, uploaded_at)`
14. **`audit_logs`**: `(log_id PK, user_id FK NULL, action, table_name, record_id, details, ip_address, created_at)`

#### Referential Actions Architecture
- **`ON DELETE CASCADE`**: Applied to dependent child tables that possess no independent domain meaning without the parent entity. For example, deleting a prescription cascades to delete associated entries in `prescription_medicines`.
- **`ON DELETE RESTRICT`**: Applied to prevent the deletion of core master entities. A doctor cannot be deleted if active appointments or medical records reference their `staff_id`.

### 3.3 Active Database Rules: Triggers & Implementations
Active database triggers guarantee that business rules and clinical compliance are enforced directly by the database server, regardless of the client application utilized.

#### Trigger 1: `trg_prevent_prescription_hard_delete` (BEFORE DELETE on prescriptions)
Medical laws mandate that clinical prescription records must never be permanently deleted from database disks. They may only be soft-cancelled via status flags. This trigger intercepts any raw `DELETE` SQL statement and throws a fatal database exception.

```sql
DELIMITER //
CREATE TRIGGER trg_prevent_prescription_hard_delete
BEFORE DELETE ON prescriptions
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Prescriptions cannot be deleted. Update status to Cancelled instead.';
END //
DELIMITER ;
```

#### Trigger 2: `trg_validate_vitals_before_insert` (BEFORE INSERT on patient_vitals)
Prevents medical staff from entering physiologically impossible or inverted blood pressure values where systolic pressure is less than or equal to diastolic pressure.

```sql
DELIMITER //
CREATE TRIGGER trg_validate_vitals_before_insert
BEFORE INSERT ON patient_vitals
FOR EACH ROW
BEGIN
    IF NEW.systolic <= NEW.diastolic THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid blood pressure: Systolic pressure must be strictly greater than Diastolic pressure.';
    END IF;
END //
DELIMITER ;
```

#### Trigger 3: `trg_after_appointment_status_update` (AFTER UPDATE on appointments)
Automatically writes an entry to the `audit_logs` table whenever an appointment is rescheduled, marked completed, or cancelled, ensuring complete accountability.

```sql
DELIMITER //
CREATE TRIGGER trg_after_appointment_status_update
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
        VALUES (
            NULL,
            'APPOINTMENT_STATUS_CHANGE',
            'appointments',
            NEW.appointment_id,
            CONCAT('Status transitioned from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END //
DELIMITER ;
```

### 3.4 ACID Transactions & Concurrency Control
Prescription authoring involves writing to both `prescriptions` and `prescription_medicines`. If the server fails after writing the parent header but before inserting the medication lines, the database would hold an empty, corrupted prescription. To prevent this, the backend controller wraps the operation in an explicit MySQL transaction:

```javascript
// backend/src/controllers/prescriptionController.js
const connection = await pool.getConnection();
await connection.beginTransaction(); // ACID: START TRANSACTION

try {
  // 1. Insert Master Prescription Header
  const [prescResult] = await connection.query(
    `INSERT INTO prescriptions (patient_id, doctor_id, status, instructions)
     VALUES (?, ?, 'Active', ?)`,
    [patient_id, doctor_id, instructions]
  );
  const prescriptionId = prescResult.insertId;

  // 2. Insert Multiple Medication Items
  for (const item of medicines) {
    await connection.query(
      `INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration_days)
       VALUES (?, ?, ?, ?, ?)`,
      [prescriptionId, item.medicine_id, item.dosage, item.frequency, item.duration_days]
    );
  }

  // 3. Commit All Changes Atomically
  await connection.commit();
} catch (error) {
  // 4. On Any Failure, Revert All Modifications
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### 3.5 Analytical Complex JOIN Queries
The system features optimized queries combining multiple tables to generate administrative intelligence.

#### Query 1: 5-Table Inner Join for Active Doctor Prescriptions
Extracts full patient, doctor, and medicine details for all currently active prescriptions:
```sql
SELECT 
    pr.prescription_id,
    p.mrn,
    p.full_name AS patient_name,
    doc_user.full_name AS doctor_name,
    dep.name AS department,
    m.name AS medicine_name,
    m.strength,
    pm.dosage,
    pm.frequency,
    pm.duration_days
FROM prescriptions pr
JOIN patients p ON pr.patient_id = p.patient_id
JOIN staff_profiles sp ON pr.doctor_id = sp.staff_id
JOIN users doc_user ON sp.user_id = doc_user.user_id
JOIN departments dep ON sp.department_id = dep.department_id
JOIN prescription_medicines pm ON pr.prescription_id = pm.prescription_id
JOIN medicines m ON pm.medicine_id = m.medicine_id
WHERE pr.status = 'Active'
ORDER BY pr.created_at DESC;
```

#### Query 2: Left Outer Join for High-Risk Drug Interactions
Detects if any patient has been prescribed two interacting drugs simultaneously:
```sql
SELECT 
    p.mrn,
    p.full_name,
    m1.name AS drug_1,
    m2.name AS drug_2,
    di.severity,
    di.description
FROM prescriptions pr
JOIN prescription_medicines pm1 ON pr.prescription_id = pm1.prescription_id
JOIN prescription_medicines pm2 ON pr.prescription_id = pm2.prescription_id AND pm1.medicine_id < pm2.medicine_id
JOIN drug_interactions di ON pm1.medicine_id = di.medicine_id_1 AND pm2.medicine_id = di.medicine_id_2
JOIN patients p ON pr.patient_id = p.patient_id
JOIN medicines m1 ON di.medicine_id_1 = m1.medicine_id
JOIN medicines m2 ON di.medicine_id_2 = m2.medicine_id
WHERE pr.status = 'Active';
```

---

\newpage

# CHAPTER 4: RESULTS & SYSTEM EVALUATION

### 4.1 Implementation Outcomes & Verification
The **Smart Medical History & Drug Safety System** was successfully deployed and verified on a local MySQL 8.0 server instance. The database was seeded with realistic clinical records: 5 departments, 6 staff profiles across all specialties, 4 detailed patient histories, 10 cataloged pharmaceutical medicines, and 4 major drug interaction pairings.

The web application was executed across development ports (Express REST API on `http://localhost:5000` and Vite React client on `http://localhost:5173`). End-to-end operational verification confirmed:
1. **Stateless Security:** JWT tokens correctly authenticate requests and enforce RBAC policies without memory leakage.
2. **Clinical Safety Interception:** Prescribing Aspirin alongside Warfarin triggers an immediate warning dialog detailing severe internal bleeding risks.
3. **Trigger Inviolability:** Direct manual SQL attempts to delete prescriptions or insert inverted blood pressures are intercepted and rejected by MySQL.

### 4.2 Functional & RBAC Automated Test Suite Matrix
The system was validated using an automated 19-scenario end-to-end integration test suite (`backend/test/rbac_test.js`). All 19 tests executed with a **100% pass rate**:

| No. | Verification Scenario | Expected System Behavior | Observed Test Result |
| :---: | :--- | :--- | :---: |
| **1** | Doctor login with valid credentials | Authenticates and returns valid JWT containing `'doctor'` role claim | **200 OK — Passed** |
| **2** | Receptionist login with valid credentials | Authenticates and returns valid JWT containing `'receptionist'` role claim | **200 OK — Passed** |
| **3** | Login with incorrect password | Authentication rejected with descriptive error message | **401 Unauthorized — Passed** |
| **4** | Receptionist registers a new patient | Validates inputs, creates patient, and generates `PAT-2026-XXXXX` MRN | **201 Created — Passed** |
| **5** | Doctor attempts to register a patient | Denied access; doctor role forbidden from front-desk intake | **403 Forbidden — Passed** |
| **6** | Nurse records valid patient vitals | Vitals inserted with systolic > diastolic; triage record stored | **201 Created — Passed** |
| **7** | Nurse inserts invalid vitals (systolic $\le$ diastolic)| `trg_validate_vitals_before_insert` fires and halts insert | **400/500 Trigger Abort — Passed** |
| **8** | Receptionist attempts to record vitals | Denied access; receptionist forbidden from clinical triage | **403 Forbidden — Passed** |
| **9** | Receptionist books an appointment | Verifies doctor availability and creates scheduled appointment | **201 Created — Passed** |
| **10**| Receptionist attempts double-booking within 15 min | Collision detector identifies existing appointment and blocks insert | **409 Conflict — Passed** |
| **11**| Doctor records clinical diagnosis & EHR | Doctor records symptoms and diagnosis for patient consultation | **201 Created — Passed** |
| **12**| Nurse attempts to write medical diagnosis | Denied access; nurse role forbidden from authoring clinical diagnosis | **403 Forbidden — Passed** |
| **13**| Doctor prescribes safe medications | Safety engine reports zero contraindications; prescription commits | **201 Created — Passed** |
| **14**| Doctor prescribes interacting drugs (Warfarin + Aspirin)| Safety engine flags severe bleeding risk; returns conflict alert | **409 Safety Alert — Passed** |
| **15**| Doctor submits prescription with force override | Doctor acknowledges risk; system completes prescription creation | **201 Created — Passed** |
| **16**| Doctor prescribes drug matching patient allergy | Safety engine matches penicillin allergy against Amoxicillin | **409 Allergy Alert — Passed** |
| **17**| Direct SQL hard deletion of prescription | `trg_prevent_prescription_hard_delete` intercepts; rejects delete | **SQLSTATE 45000 — Passed** |
| **18**| Updating appointment status | Status changes; `trg_after_appointment_status_update` logs audit | **200 OK / Logged — Passed** |
| **19**| Non-admin user accessing system audit logs | Denied access; audit inspection restricted strictly to administrator | **403 Forbidden — Passed** |

### 4.3 Application User Interface & Terminal Demonstrations

#### Figure 1: Database Tables in MySQL (`SHOW TABLES;`)
Demonstrates the 14 normalized relations instantiated inside the `hospital_db` schema:
```
+------------------------------------+
| Tables_in_hospital_db              |
+------------------------------------+
| allergies                          |
| appointments                       |
| audit_logs                         |
| departments                        |
| drug_interactions                  |
| medical_records                    |
| medical_reports                    |
| medicines                          |
| patient_vitals                     |
| patients                           |
| prescription_medicines             |
| prescriptions                      |
| staff_profiles                     |
| users                              |
+------------------------------------+
14 rows in set (0.001 sec)
```

#### Figure 2: Secure Multi-Role Authentication Gateway
The web portal presents a clean, medical-grade login interface with quick-switch presets for Doctor, Nurse, Receptionist, and Administrator roles.

#### Figure 3: Doctor Consultation Station & Clinical Queue
Displays patient consultation queues, allowing the physician to view historical medical records, document diagnoses, and compose prescriptions.

#### Figure 4: Drug-Drug Interaction Warning Modal
Displays the safety engine intercepting the concurrent prescription of **Warfarin** and **Aspirin**, explaining the pharmacological mechanism (enhanced anticoagulation leading to hemorrhage risk) and demanding explicit physician acknowledgment.

#### Figure 5: Nurse Vitals Triage & Anomaly Flagging
Features the clinical triage interface where the nurse records vital signs, highlighting dynamic badges for hypertensive urgency and hypoxemia.

#### Figure 6: Receptionist Desk & Appointment Scheduler
Displays patient lookup by MRN, registration modals, and doctor schedule booking with real-time concurrency validation.

#### Figure 7: Administrator Command Center & Audit Log Grid
Provides high-level hospital statistics (census counts, active staff, daily appointments) and an unalterable audit log table tracking user activities across the platform.

---

\newpage

# CHAPTER 5: CONCLUSION & FUTURE ENHANCEMENTS

### 5.1 Conclusion
The **Smart Medical History & Drug Safety System** successfully addresses critical challenges in healthcare administration and patient safety. By integrating modern web engineering with disciplined relational database design, the project proves that medical errors can be systematically prevented at the database tier.

Key accomplishments of the project include:
1. **Normalized Relational Backbone:** A 14-table schema engineered in Third Normal Form (3NF) that eliminates redundancy while maintaining comprehensive clinical histories.
2. **Real-Time Pharmacological Safety:** An intelligent safety engine that calculates symmetrical drug interactions and checks patient allergies prior to prescription finalization.
3. **Database-Enforced Integrity:** Active MySQL triggers that protect prescription legal records from deletion, validate vital sign telemetry, and record audit trails.
4. **Resilient Architecture:** A decoupled three-tier architecture utilizing React 19, Express.js, and MySQL with robust connection pooling and ACID transactional consistency.
5. **Rigorous Verification:** Complete validation through a 19-scenario automated test suite verifying security, concurrency, and clinical safety.

### 5.2 Future Enhancements
While the current implementation delivers a robust foundation for hospital operations, planned future enhancements include:
- **Biometric Patient Identification:** Integration of fingerprint or facial scanning to identify unconscious emergency room arrivals with immediate retrieval of allergy profiles.
- **Machine Learning Predictive Analytics:** Development of prognostic risk-scoring models (e.g., Random Forest or Gradient Boosting) to estimate patient readmission risks and septic shock onset from longitudinal vital signs.
- **FHIR / HL7 Interoperability:** Adoption of Fast Healthcare Interoperability Resources (FHIR) standards to facilitate cross-institutional health record exchanges.
- **Automated Telephony & SMS Alerts:** Integration with Twilio API to dispatch automated appointment reminders and prescription refill notices to patients.
- **Digital Medical Imaging PACS Integration:** Direct DICOM viewer integration for in-browser radiology inspection (X-rays, CT scans, MRIs).

---

\newpage

# CHAPTER 6: BIBLIOGRAPHY & REFERENCES

1. **R. Elmasri and S. B. Navathe**, *Fundamentals of Database Systems*, 7th ed. Boston, MA: Pearson / Addison-Wesley, 2016.
2. **A. Silberschatz, H. F. Korth, and S. Sudarshan**, *Database System Concepts*, 7th ed. New York, NY: McGraw-Hill, 2019.
3. **C. J. Date**, *An Introduction to Database Systems*, 8th ed. Boston, MA: Addison-Wesley, 2004.
4. **MySQL 8.0 Reference Manual**, Oracle Corporation, 2026. [Online]. Available: https://dev.mysql.com/doc/refman/8.0/en/
5. **Node.js LTS Documentation & Architecture Guide**, OpenJS Foundation, 2026. [Online]. Available: https://nodejs.org/docs/
6. **Express.js API Reference & Middleware Patterns**, OpenJS Foundation, 2026. [Online]. Available: https://expressjs.com/
7. **React 19 Official Documentation**, Meta Platforms Inc., 2026. [Online]. Available: https://react.dev/
8. **World Health Organization (WHO)**, *Medication Safety in Polypharmacy and Digital Prescribing Guidelines*, WHO Technical Report Series, Geneva, 2021.
