-- ====================================================================
-- Hospital Management System (HMS) - Database Schema
-- DBMS Project - Relational Schema Definition
-- Target Engine: MySQL 8.0+ (InnoDB)
-- ====================================================================

-- 1. Create and select Database
CREATE DATABASE IF NOT EXISTS hospital_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hospital_db;

-- 2. Drop existing tables if needed (in reverse order of foreign key dependencies)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS medical_reports;
DROP TABLE IF EXISTS prescription_medicines;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS drug_interactions;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS patient_vitals;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS allergies;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS staff_profiles;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- TABLE 1: users
-- Core authentication table for all hospital staff
-- ====================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'receptionist') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 2: departments
-- Hospital clinical departments (e.g. Cardiology, Pediatrics)
-- ====================================================================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 3: staff_profiles
-- Profile details for hospital staff (Doctors, Nurses, Receptionists, Admins)
-- Extends the users table in a clean 1:1 relationship
-- ====================================================================
CREATE TABLE staff_profiles (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department_id INT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    license_number VARCHAR(50) NULL,
    specialization VARCHAR(100) NULL,
    staff_type ENUM('doctor', 'nurse', 'receptionist', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id)
        REFERENCES departments(department_id) ON DELETE SET NULL,
    INDEX idx_staff_type (staff_type),
    INDEX idx_staff_department (department_id)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 4: patients
-- Patient demographic and clinical registration data
-- MRN = Medical Record Number (Unique identifier)
-- user_id is nullable (supports walk-ins registered by receptionists)
-- ====================================================================
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_mrn (mrn),
    INDEX idx_patient_name (last_name, first_name),
    INDEX idx_patient_phone (phone)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 5: allergies
-- Known patient allergies for drug-safety cross-checking
-- ====================================================================
CREATE TABLE allergies (
    allergy_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    allergen VARCHAR(100) NOT NULL,
    reaction VARCHAR(255) NULL,
    severity ENUM('mild', 'moderate', 'severe') NOT NULL DEFAULT 'moderate',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id) ON DELETE CASCADE,
    INDEX idx_allergy_patient (patient_id)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 6: appointments
-- Clinical consultation schedule managed by Receptionists & Doctors
-- ====================================================================
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    scheduled_by_staff_id INT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    status ENUM('scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id)
        REFERENCES staff_profiles(staff_id) ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_scheduler FOREIGN KEY (scheduled_by_staff_id)
        REFERENCES staff_profiles(staff_id) ON DELETE RESTRICT,
    INDEX idx_appointment_doctor_date (doctor_id, appointment_datetime),
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_status (status)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 7: patient_vitals
-- Recorded by Nurses during triage or inpatient monitoring
-- ====================================================================
CREATE TABLE patient_vitals (
    vitals_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT NULL,
    recorded_by_nurse_id INT NOT NULL,
    systolic_bp INT NULL,
    diastolic_bp INT NULL,
    heart_rate INT NULL,
    temperature_celsius DECIMAL(4,1) NULL,
    respiratory_rate INT NULL,
    oxygen_saturation INT NULL,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vitals_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_vitals_appointment FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    CONSTRAINT fk_vitals_nurse FOREIGN KEY (recorded_by_nurse_id)
        REFERENCES staff_profiles(staff_id) ON DELETE RESTRICT,
    INDEX idx_vitals_patient (patient_id),
    INDEX idx_vitals_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 8: medical_records
-- Clinical consultation notes and diagnoses authored by Doctors
-- ====================================================================
CREATE TABLE medical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT NULL,
    diagnosis_title VARCHAR(255) NOT NULL,
    symptoms TEXT,
    physical_examination TEXT,
    treatment_plan TEXT,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_record_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_record_doctor FOREIGN KEY (doctor_id)
        REFERENCES staff_profiles(staff_id) ON DELETE RESTRICT,
    CONSTRAINT fk_record_appointment FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    INDEX idx_record_patient (patient_id),
    INDEX idx_record_doctor (doctor_id)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 9: medicines
-- Pharmaceutical catalog with generic and brand names
-- ====================================================================
CREATE TABLE medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    generic_name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    dosage_form ENUM('Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Inhaler') NOT NULL,
    strength VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_medicine_name (name),
    INDEX idx_medicine_generic (generic_name)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 10: drug_interactions
-- Self-referencing M:N relationship detecting drug-drug safety conflicts
-- Constraint: medicine_id_1 < medicine_id_2 prevents duplicate inverse rows
-- ====================================================================
CREATE TABLE drug_interactions (
    interaction_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id_1 INT NOT NULL,
    medicine_id_2 INT NOT NULL,
    severity ENUM('minor', 'moderate', 'major', 'contraindicated') NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interaction_med1 FOREIGN KEY (medicine_id_1)
        REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    CONSTRAINT fk_interaction_med2 FOREIGN KEY (medicine_id_2)
        REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    CONSTRAINT uq_drug_pair UNIQUE (medicine_id_1, medicine_id_2),
    CONSTRAINT chk_drug_order CHECK (medicine_id_1 < medicine_id_2)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 11: prescriptions
-- Medical prescriptions authored by doctors
-- ====================================================================
CREATE TABLE prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    record_id INT NULL,
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id)
        REFERENCES staff_profiles(staff_id) ON DELETE RESTRICT,
    CONSTRAINT fk_prescription_record FOREIGN KEY (record_id)
        REFERENCES medical_records(record_id) ON DELETE SET NULL,
    INDEX idx_prescription_patient (patient_id),
    INDEX idx_prescription_doctor (doctor_id)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 12: prescription_medicines
-- Junction table linking prescriptions to specific medicines with dosage
-- ====================================================================
CREATE TABLE prescription_medicines (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions TEXT,
    CONSTRAINT fk_pm_prescription FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_medicine FOREIGN KEY (medicine_id)
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT,
    INDEX idx_pm_prescription (prescription_id),
    INDEX idx_pm_medicine (medicine_id)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 13: medical_reports
-- Diagnostic test results and scans (Blood work, X-Ray, etc.)
-- ====================================================================
CREATE TABLE medical_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    uploaded_by_user_id INT NOT NULL,
    record_id INT NULL,
    report_title VARCHAR(150) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    report_date DATE NOT NULL,
    summary_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_uploader FOREIGN KEY (uploaded_by_user_id)
        REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_report_record FOREIGN KEY (record_id)
        REFERENCES medical_records(record_id) ON DELETE SET NULL,
    INDEX idx_report_patient (patient_id)
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE 14: audit_logs
-- Security and compliance logging for sensitive data access and actions
-- ====================================================================
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NULL,
    target_id INT NULL,
    ip_address VARCHAR(45) NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB;

-- ====================================================================
-- TRIGGERS: Event-Driven Database Integrity & Automated Auditing
-- ====================================================================

DELIMITER $$
-- TRIGGER 1: Prevent Hard Deletion of Prescriptions (Legal Immutability)
CREATE TRIGGER trg_prevent_prescription_hard_delete
BEFORE DELETE ON prescriptions
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Prescriptions are legally immutable and cannot be hard deleted. Use soft deactivation.';
END$$

-- TRIGGER 2: Physiological Sanity Validation on Vitals (Systolic > Diastolic)
CREATE TRIGGER trg_validate_vitals_before_insert
BEFORE INSERT ON patient_vitals
FOR EACH ROW
BEGIN
    IF NEW.systolic_bp IS NOT NULL AND NEW.diastolic_bp IS NOT NULL THEN
        IF NEW.systolic_bp <= NEW.diastolic_bp THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Clinical Error: Systolic blood pressure must be strictly greater than diastolic.';
        END IF;
    END IF;
END$$

-- TRIGGER 3: Automated Audit Log on Appointment Status Changes
CREATE TRIGGER trg_after_appointment_status_update
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_logs (user_id, action, target_table, target_id, ip_address, details)
        VALUES (
            NEW.scheduled_by_staff_id,
            'TRIGGER_APPOINTMENT_STATUS_CHANGE',
            'appointments',
            NEW.appointment_id,
            '127.0.0.1',
            CONCAT('Status automatically transitioned from [', OLD.status, '] to [', NEW.status, ']')
        );
    END IF;
END$$
DELIMITER ;

