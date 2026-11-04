-- ====================================================================
-- Hospital Management System - Database Triggers
-- Demonstrates Event-Driven Database Integrity & Automated Auditing
-- Target: MySQL 8.0+
-- ====================================================================

USE hospital_db;

DROP TRIGGER IF EXISTS trg_prevent_prescription_hard_delete;
DROP TRIGGER IF EXISTS trg_validate_vitals_before_insert;
DROP TRIGGER IF EXISTS trg_after_appointment_status_update;

-- ====================================================================
-- TRIGGER 1: trg_prevent_prescription_hard_delete (BEFORE DELETE)
-- Enforces Legal & Regulatory Immutability on Prescription Records.
-- Raises SQL error 45000 if anyone executes raw "DELETE FROM prescriptions".
-- ====================================================================
DELIMITER $$
CREATE TRIGGER trg_prevent_prescription_hard_delete
BEFORE DELETE ON prescriptions
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Prescriptions are legally immutable and cannot be hard deleted. Use soft deactivation.';
END$$
DELIMITER ;

-- ====================================================================
-- TRIGGER 2: trg_validate_vitals_before_insert (BEFORE INSERT)
-- Enforces Physiological Sanity Check at Database Engine Level.
-- Ensures Systolic BP > Diastolic BP.
-- ====================================================================
DELIMITER $$
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
DELIMITER ;

-- ====================================================================
-- TRIGGER 3: trg_after_appointment_status_update (AFTER UPDATE)
-- Automated Audit Trail without application-level intervention.
-- Fires whenever appointment status changes (e.g. scheduled -> checked_in).
-- ====================================================================
DELIMITER $$
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
