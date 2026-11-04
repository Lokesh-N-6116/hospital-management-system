-- ====================================================================
-- CarePulse Hospital Management System - Key Viva & Evaluation SQL Queries
-- Use these queries to show your examiners the relational schema,
-- constraints, joins, and drug safety engine directly inside MySQL.
-- ====================================================================

USE hospital_db;

-- 1. Show all 14 normalized tables
SHOW TABLES;

-- 2. Inspect table schemas (Columns, Data Types, Nullability, Keys)
DESCRIBE users;
DESCRIBE patients;
DESCRIBE appointments;
DESCRIBE patient_vitals;
DESCRIBE prescriptions;
DESCRIBE drug_interactions;

-- 3. Show Primary Keys, Foreign Keys, and CHECK Constraints
-- Notice: CHECK (medicine_id_1 < medicine_id_2) on drug_interactions
SHOW CREATE TABLE drug_interactions\G
SHOW CREATE TABLE prescriptions\G
SHOW CREATE TABLE appointments\G

-- 4. View Users & Hashed Passwords (demonstrates bcrypt encryption & RBAC roles)
SELECT user_id, username, email, role, is_active, created_at FROM users;

-- 5. View Hospital Staff Profiles with Department Joins
SELECT s.staff_id, s.first_name, s.last_name, s.staff_type, s.license_number, 
       s.specialization, d.name AS department_name
FROM staff_profiles s
LEFT JOIN departments d ON s.department_id = d.department_id;

-- 6. View Patient Records with Medical Record Numbers (MRN)
SELECT patient_id, mrn, first_name, last_name, date_of_birth, gender, blood_group, phone 
FROM patients;

-- 7. View Appointments Joined with Patient and Doctor Details
SELECT a.appointment_id, a.appointment_datetime, a.status,
       CONCAT(p.first_name, ' ', p.last_name) AS patient_name, p.mrn,
       CONCAT(s.first_name, ' ', s.last_name) AS doctor_name, s.specialization
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN staff_profiles s ON a.doctor_id = s.staff_id
ORDER BY a.appointment_datetime ASC;

-- 8. View Nurse Vitals Records (Hemodynamic monitoring)
SELECT v.vitals_id, v.recorded_at,
       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
       CONCAT(v.systolic_bp, '/', v.diastolic_bp, ' mmHg') AS blood_pressure,
       v.heart_rate, v.temperature_celsius, v.oxygen_saturation,
       CONCAT(s.first_name, ' ', s.last_name) AS recorded_by_nurse
FROM patient_vitals v
JOIN patients p ON v.patient_id = p.patient_id
JOIN staff_profiles s ON v.recorded_by_nurse_id = s.staff_id;

-- 9. View Clinical Diagnoses authored by Doctors
SELECT r.record_id, r.record_date,
       CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
       CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
       r.diagnosis_title, r.treatment_plan
FROM medical_records r
JOIN patients p ON r.patient_id = p.patient_id
JOIN staff_profiles s ON r.doctor_id = s.staff_id;

-- 10. View Prescriptions with Multi-Table Join to Medicine Line Items
SELECT p.prescription_id, p.prescription_date, p.is_active,
       CONCAT(pat.first_name, ' ', pat.last_name) AS patient_name,
       CONCAT(doc.first_name, ' ', doc.last_name) AS doctor_name,
       m.name AS medicine_name, pm.dosage, pm.frequency, pm.duration
FROM prescriptions p
JOIN patients pat ON p.patient_id = pat.patient_id
JOIN staff_profiles doc ON p.doctor_id = doc.staff_id
JOIN prescription_medicines pm ON p.prescription_id = pm.prescription_id
JOIN medicines m ON pm.medicine_id = m.medicine_id
ORDER BY p.prescription_id DESC;

-- 11. View Documented Drug-Drug Adverse Interactions (Self-Referencing M:N Join)
SELECT di.interaction_id,
       m1.name AS medicine_1,
       m2.name AS medicine_2,
       di.severity,
       di.description,
       di.recommendation
FROM drug_interactions di
JOIN medicines m1 ON di.medicine_id_1 = m1.medicine_id
JOIN medicines m2 ON di.medicine_id_2 = m2.medicine_id
ORDER BY di.severity DESC;

-- 12. View Non-Repudiation Security Audit Logs
SELECT log_id, created_at, action, target_table, target_id, ip_address, details
FROM audit_logs
ORDER BY created_at DESC LIMIT 10;

-- ====================================================================
-- SECTION 13: HOW TO DEMONSTRATE DATABASE TRIGGERS TO EXAMINERS
-- ====================================================================

-- A. List all installed triggers in the database
SHOW TRIGGERS\G

-- B. Test Trigger 1: Immutable Prescriptions (BEFORE DELETE)
-- Expected Result: MySQL throws error 45000 and blocks the delete!
DELETE FROM prescriptions WHERE prescription_id = 1;

-- C. Test Trigger 2: Physiological Vitals Sanity Check (BEFORE INSERT)
-- Expected Result: Fails because Diastolic BP (120) > Systolic BP (80)
INSERT INTO patient_vitals (patient_id, recorded_by_nurse_id, systolic_bp, diastolic_bp) 
VALUES (1, 4, 80, 120);

-- D. Test Trigger 3: Automated Audit Log on Status Change (AFTER UPDATE)
-- Step 1: Update an appointment status
UPDATE appointments SET status = 'completed' WHERE appointment_id = 2;
-- Step 2: Show that the trigger automatically logged this event into audit_logs!
SELECT * FROM audit_logs 
WHERE action = 'TRIGGER_APPOINTMENT_STATUS_CHANGE' 
ORDER BY log_id DESC LIMIT 1\G

