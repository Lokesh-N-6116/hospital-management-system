-- ====================================================================
-- Hospital Management System (HMS) - Database Seed Data
-- DBMS Project - Initial Population
-- ====================================================================

USE hospital_db;

-- 1. Seed Departments
INSERT INTO departments (department_id, name, description) VALUES
(1, 'General Medicine', 'Primary adult healthcare, general diagnoses, and preventive care.'),
(2, 'Cardiology', 'Specialized care for heart, cardiovascular systems, and hypertension.'),
(3, 'Pediatrics', 'Comprehensive medical care for infants, children, and adolescents.'),
(4, 'Orthopedics', 'Musculoskeletal system, joints, bones, and trauma management.'),
(5, 'Emergency & Trauma', '24/7 urgent medical triage and critical emergency care.');

-- 2. Seed Users
-- Password for all seed users is: password123
-- Bcrypt Hash: $2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O
INSERT INTO users (user_id, username, email, password_hash, role, is_active) VALUES
(1, 'admin', 'admin@hospital.local', '$2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O', 'admin', TRUE),
(2, 'dr.sharma', 'dr.sharma@hospital.local', '$2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O', 'doctor', TRUE),
(3, 'dr.patel', 'dr.patel@hospital.local', '$2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O', 'doctor', TRUE),
(4, 'nurse.mary', 'nurse.mary@hospital.local', '$2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O', 'nurse', TRUE),
(5, 'nurse.anita', 'nurse.anita@hospital.local', '$2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O', 'nurse', TRUE),
(6, 'reception.rahul', 'reception.rahul@hospital.local', '$2b$10$TpnwaFbJW1fAc.ZqHrIS/eDE706nKmg6it0joeJ8pDZQXJVKsZZ0O', 'receptionist', TRUE);

-- 3. Seed Staff Profiles
INSERT INTO staff_profiles (staff_id, user_id, department_id, first_name, last_name, phone, license_number, specialization, staff_type) VALUES
(1, 1, 1, 'System', 'Administrator', '+91-9800000001', 'ADMIN-001', 'Hospital IT Administration', 'admin'),
(2, 2, 2, 'Rajesh', 'Sharma', '+91-9800000002', 'MCI-CARD-4412', 'Cardiologist & Hypertension Specialist', 'doctor'),
(3, 3, 3, 'Pooja', 'Patel', '+91-9800000003', 'MCI-PED-8891', 'Senior Pediatrician', 'doctor'),
(4, 4, 2, 'Mary', 'Joseph', '+91-9800000004', 'NUR-CARD-201', 'Cardiology Care Specialist', 'nurse'),
(5, 5, 1, 'Anita', 'Deshmukh', '+91-9800000005', 'NUR-GEN-105', 'General Triage Nurse', 'nurse'),
(6, 6, 1, 'Rahul', 'Verma', '+91-9800000006', 'REC-MAIN-001', 'Chief Patient Desk Executive', 'receptionist');

-- 4. Seed Patients
INSERT INTO patients (patient_id, mrn, first_name, last_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact_name, emergency_contact_phone) VALUES
(1, 'PAT-2026-0001', 'Ramesh', 'Kumar', '1981-06-15', 'Male', 'A+', '+91-9876543210', 'ramesh.k@gmail.com', 'Flat 402, Green Valley Apts, Sector 14, Bengaluru', 'Sunita Kumar (Wife)', '+91-9876543211'),
(2, 'PAT-2026-0002', 'Priya', 'Nair', '1994-03-22', 'Female', 'B+', '+91-9876501234', 'priya.nair@outlook.com', '12/A, Rosewood Lane, Indiranagar, Bengaluru', 'Kavita Nair (Mother)', '+91-9876501235'),
(3, 'PAT-2026-0003', 'Amit', 'Verma', '1966-11-09', 'Male', 'O+', '+91-9876512345', 'amit.verma66@yahoo.com', 'Villa 7, Palm Meadows, Whitefield, Bengaluru', 'Deepak Verma (Son)', '+91-9876512346'),
(4, 'PAT-2026-0004', 'Sneha', 'Rao', '1998-08-14', 'Female', 'AB+', '+91-9876523456', 'sneha.rao@gmail.com', '304, Sunshine Towers, Koramangala, Bengaluru', 'Vikram Rao (Brother)', '+91-9876523457');

-- 5. Seed Known Allergies
INSERT INTO allergies (allergy_id, patient_id, allergen, reaction, severity, notes) VALUES
(1, 1, 'Penicillin', 'Skin rash, urticaria, facial swelling', 'severe', 'Contraindicated for all beta-lactam class antibiotics.'),
(2, 4, 'Aspirin', 'Gastric pain, mild bronchospasm', 'moderate', 'Avoid all high-dose NSAIDs.');

-- 6. Seed Appointments
INSERT INTO appointments (appointment_id, patient_id, doctor_id, scheduled_by_staff_id, appointment_datetime, status, reason) VALUES
(1, 1, 2, 6, DATE_ADD(NOW(), INTERVAL 1 HOUR), 'in_consultation', 'Routine cardiac follow-up and blood pressure management.'),
(2, 2, 3, 6, DATE_ADD(NOW(), INTERVAL 3 HOUR), 'checked_in', 'Recurrent seasonal cough and respiratory allergy review.'),
(3, 3, 2, 6, DATE_ADD(NOW(), INTERVAL 1 DAY), 'scheduled', 'Post-DVT anticoagulant review and INR dosage adjustment.'),
(4, 4, 2, 6, DATE_SUB(NOW(), INTERVAL 2 DAY), 'completed', 'Chest discomfort evaluation; ECG cleared.');

-- 7. Seed Patient Vitals (Recorded by Nurses)
INSERT INTO patient_vitals (vitals_id, patient_id, appointment_id, recorded_by_nurse_id, systolic_bp, diastolic_bp, heart_rate, temperature_celsius, respiratory_rate, oxygen_saturation, notes, recorded_at) VALUES
(1, 1, 1, 4, 142, 90, 82, 37.0, 18, 98, 'Patient reported mild morning headache. BP elevated.', NOW()),
(2, 2, 2, 5, 118, 76, 72, 36.8, 16, 99, 'Normal resting vitals. Clear lung sounds noted.', NOW()),
(3, 4, 4, 4, 120, 80, 75, 36.7, 16, 99, 'Resting vitals stable prior to doctor examination.', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 8. Seed Medical Records (Diagnoses by Doctors)
INSERT INTO medical_records (record_id, patient_id, doctor_id, appointment_id, diagnosis_title, symptoms, physical_examination, treatment_plan, record_date) VALUES
(1, 1, 2, 1, 'Stage 1 Essential Hypertension', 'Occasional morning headaches, mild fatigue.', 'S1/S2 heard clearly, no cardiac murmur. BMI: 27.2. Mild peripheral resistance.', 'Initiate Metoprolol 50mg daily. Recommend low sodium diet and 30-min brisk walk.', NOW()),
(2, 4, 2, 4, 'Non-Cardiac Chest Wall Pain (Costochondritis)', 'Localized tenderness along left sternal border, exacerbated by deep inspiration.', 'Costochondral junction tenderness reproducible upon palpation. Normal ECG.', 'Reassurance given. Prescribed Paracetamol for pain relief. Avoid NSAIDs due to allergy.', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 9. Seed Medicines Catalog
INSERT INTO medicines (medicine_id, name, generic_name, category, dosage_form, strength, description) VALUES
(1, 'Warfarin Sodium', 'Warfarin', 'Anticoagulant', 'Tablet', '5mg', 'Vitamin K antagonist oral anticoagulant for thrombosis and DVT prevention.'),
(2, 'Ecosprin 75', 'Aspirin', 'Antiplatelet / NSAID', 'Tablet', '75mg', 'Low-dose acetylsalicylic acid used to inhibit platelet aggregation.'),
(3, 'Brufen 400', 'Ibuprofen', 'NSAID', 'Tablet', '400mg', 'Non-steroidal anti-inflammatory drug for pain, fever, and inflammation.'),
(4, 'Novamox 500', 'Amoxicillin', 'Antibiotic (Penicillin class)', 'Capsule', '500mg', 'Broad-spectrum beta-lactam antibiotic for bacterial infections.'),
(5, 'Cifran 500', 'Ciprofloxacin', 'Antibiotic (Fluoroquinolone)', 'Tablet', '500mg', 'Broad-spectrum fluoroquinolone antibiotic for urinary and gastrointestinal infections.'),
(6, 'Deriphyllin', 'Theophylline', 'Bronchodilator', 'Tablet', '200mg', 'Methylxanthine bronchodilator used for asthma and chronic COPD relief.'),
(7, 'Betaloc 50', 'Metoprolol Tartrate', 'Beta-Blocker', 'Tablet', '50mg', 'Selective beta-1 adrenoreceptor blocker for hypertension and angina.'),
(8, 'Dolo 650', 'Paracetamol', 'Analgesic & Antipyretic', 'Tablet', '650mg', 'Standard first-line medication for mild pain and pyrexia (fever).'),
(9, 'Glycomet 500', 'Metformin HCl', 'Antidiabetic (Biguanide)', 'Tablet', '500mg', 'First-line medication for treatment of type 2 diabetes mellitus.'),
(10, 'Lipitor 20', 'Atorvastatin', 'Lipid-lowering (Statin)', 'Tablet', '20mg', 'HMG-CoA reductase inhibitor used to reduce cholesterol and cardiovascular risk.');

-- 10. Seed Drug-Drug Interactions
-- Note constraint: medicine_id_1 < medicine_id_2
INSERT INTO drug_interactions (interaction_id, medicine_id_1, medicine_id_2, severity, description, recommendation) VALUES
(1, 1, 2, 'major', 'Warfarin + Aspirin: Concurrent use severely increases the risk of major upper gastrointestinal and systemic bleeding due to dual anticoagulant and antiplatelet inhibition.', 'Avoid concurrent use unless strictly advised by a cardiologist with frequent INR monitoring.'),
(2, 1, 3, 'major', 'Warfarin + Ibuprofen: Ibuprofen displaces warfarin from protein-binding sites and compromises the gastric protective barrier, causing high risk of ulcer bleeding.', 'Contraindicated. Use Paracetamol as an alternative analgesic.'),
(3, 2, 3, 'moderate', 'Aspirin + Ibuprofen: Ibuprofen competitively binds to COX-1, attenuating the cardioprotective antiplatelet effect of low-dose aspirin.', 'Take low-dose aspirin at least 30 minutes before or 8 hours after ibuprofen.'),
(4, 5, 6, 'contraindicated', 'Ciprofloxacin + Theophylline: Ciprofloxacin strongly inhibits CYP1A2 hepatic metabolism, causing severe toxic accumulation of theophylline (arrhythmias, seizures).', 'Strictly contraindicated. Substitute with an alternative antibiotic class or monitor serum theophylline closely.');

-- 11. Seed Prescriptions
INSERT INTO prescriptions (prescription_id, patient_id, doctor_id, record_id, prescription_date, instructions, is_active) VALUES
(1, 1, 2, 1, NOW(), 'Take medications regularly after meals. Review blood pressure in 2 weeks.', TRUE),
(2, 4, 2, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Take paracetamol strictly on as-needed basis for pain.', TRUE);

-- 12. Seed Prescription Medicines
INSERT INTO prescription_medicines (item_id, prescription_id, medicine_id, dosage, frequency, duration, instructions) VALUES
(1, 1, 7, '1 Tablet', 'Once daily (Morning)', '30 days', 'Take after breakfast.'),
(2, 1, 8, '1 Tablet', 'SOS (As needed for pain)', '5 days', 'Maximum 3 tablets in 24 hours.'),
(3, 2, 8, '1 Tablet', 'Twice daily after meals', '3 days', 'Stop once pain subsides.');

-- 13. Seed Medical Reports
INSERT INTO medical_reports (report_id, patient_id, uploaded_by_user_id, record_id, report_title, report_type, file_url, report_date, summary_notes) VALUES
(1, 1, 2, 1, '12-Lead Resting Electrocardiogram (ECG)', 'Cardiology Scan', '/uploads/reports/ecg_ramesh_kumar.pdf', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Sinus rhythm, normal axis, no acute ST-T changes detected.'),
(2, 1, 1, 1, 'Comprehensive Lipid Profile & Fasting Blood Sugar', 'Biochemistry Lab', '/uploads/reports/lipid_ramesh_kumar.pdf', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Total Cholesterol: 210 mg/dL, HDL: 44 mg/dL, LDL: 135 mg/dL, FBS: 98 mg/dL.');

-- 14. Seed Audit Logs
INSERT INTO audit_logs (log_id, user_id, action, target_table, target_id, ip_address, details) VALUES
(1, 1, 'SYSTEM_INITIALIZATION', 'system', NULL, '127.0.0.1', 'Database created and initial clinical seed data loaded.'),
(2, 6, 'APPOINTMENT_SCHEDULED', 'appointments', 1, '127.0.0.1', 'Receptionist scheduled consultation for patient PAT-2026-0001 with Dr. Rajesh Sharma.'),
(3, 4, 'VITALS_RECORDED', 'patient_vitals', 1, '127.0.0.1', 'Nurse Mary recorded triage vitals for patient PAT-2026-0001.');
