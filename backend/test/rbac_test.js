/**
 * Automated Verification & RBAC Penetration Test Suite
 * Validates database connectivity, token issuance, role-based boundary enforcement,
 * and drug safety checks.
 */
const pool = require('../src/config/db');
const app = require('../src/server');
const http = require('http');

let server;
const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {})
    };

    const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
}

async function runTests() {
    console.log('\n========================================================');
    console.log('   HMS AUTOMATED VERIFICATION & RBAC TEST SUITE        ');
    console.log('========================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName) {
        if (condition) {
            console.log(`  [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${testName}`);
            failed++;
        }
    }

    try {
        // Start test server
        server = http.createServer(app);
        await new Promise(resolve => server.listen(PORT, resolve));

        // 1. Healthcheck
        const health = await request('/api/health');
        assert(health.status === 200 && health.data.status === 'UP', 'Server is healthy and responding');

        // 2. Authentication for all 4 roles
        console.log('\n--- 1. Testing Role Authentication ---');
        const adminAuth = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'admin', password: 'password123' }
        });
        assert(adminAuth.status === 200 && adminAuth.data.user.role === 'admin', 'Admin login successful');
        const adminToken = adminAuth.data.token;

        const doctorAuth = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'dr.sharma', password: 'password123' }
        });
        assert(doctorAuth.status === 200 && doctorAuth.data.user.role === 'doctor', 'Doctor login successful');
        const doctorToken = doctorAuth.data.token;

        const nurseAuth = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'nurse.mary', password: 'password123' }
        });
        assert(nurseAuth.status === 200 && nurseAuth.data.user.role === 'nurse', 'Nurse login successful');
        const nurseToken = nurseAuth.data.token;

        const receptionAuth = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'reception.rahul', password: 'password123' }
        });
        assert(receptionAuth.status === 200 && receptionAuth.data.user.role === 'receptionist', 'Receptionist login successful');
        const receptionToken = receptionAuth.data.token;

        // 3. Receptionist Capabilities & Boundaries
        console.log('\n--- 2. Receptionist RBAC Checks ---');
        // A. Receptionist CAN create patient
        const newPatient = await request('/api/patients', {
            method: 'POST',
            token: receptionToken,
            body: {
                firstName: 'Test',
                lastName: 'Candidate',
                dateOfBirth: '1990-05-10',
                gender: 'Male',
                phone: '+91-9999988888',
                bloodGroup: 'O+'
            }
        });
        assert(newPatient.status === 201 && newPatient.data.patientId, 'Receptionist CAN register new patient (HTTP 201)');
        const testPatientId = newPatient.data.patientId;

        // B. Receptionist CANNOT create prescription (Must get 403 Forbidden)
        const receptionRx = await request('/api/prescriptions', {
            method: 'POST',
            token: receptionToken,
            body: {
                patientId: testPatientId,
                medicines: [{ medicineId: 8, dosage: '1 tab', frequency: 'daily', duration: '5 days' }]
            }
        });
        assert(receptionRx.status === 403, 'Receptionist CANNOT author prescriptions (HTTP 403 Forbidden)');

        // 4. Nurse Capabilities & Boundaries
        console.log('\n--- 3. Nurse RBAC Checks ---');
        // A. Nurse CAN record vitals
        const nurseVitals = await request('/api/vitals', {
            method: 'POST',
            token: nurseToken,
            body: {
                patientId: testPatientId,
                systolicBp: 120,
                diastolicBp: 80,
                heartRate: 74,
                temperatureCelsius: 36.6,
                respiratoryRate: 16,
                oxygenSaturation: 99
            }
        });
        assert(nurseVitals.status === 201, 'Nurse CAN record patient vitals (HTTP 201)');

        // B. Nurse CANNOT create prescriptions (Must get 403 Forbidden)
        const nurseRx = await request('/api/prescriptions', {
            method: 'POST',
            token: nurseToken,
            body: {
                patientId: testPatientId,
                medicines: [{ medicineId: 8, dosage: '1 tab', frequency: 'daily', duration: '5 days' }]
            }
        });
        assert(nurseRx.status === 403, 'Nurse CANNOT author prescriptions (HTTP 403 Forbidden)');

        // C. Nurse CANNOT deactivate prescriptions
        const nurseDeact = await request('/api/prescriptions/1/deactivate', {
            method: 'PATCH',
            token: nurseToken,
            body: { reason: 'Test' }
        });
        assert(nurseDeact.status === 403, 'Nurse CANNOT deactivate/modify prescriptions (HTTP 403 Forbidden)');

        // 5. Doctor Capabilities & Drug Safety Engine
        console.log('\n--- 4. Doctor Capabilities & Drug Safety Engine ---');
        // A. Doctor CAN document diagnosis
        const docDiagnosis = await request('/api/clinical/records', {
            method: 'POST',
            token: doctorToken,
            body: {
                patientId: testPatientId,
                diagnosisTitle: 'Acute Pharyngitis',
                treatmentPlan: 'Hydration and symptomatic relief'
            }
        });
        assert(docDiagnosis.status === 201, 'Doctor CAN document clinical diagnosis (HTTP 201)');

        // B. Drug-Drug Safety Check: Warfarin (id 1) + Aspirin (id 2)
        const drugCheck = await request('/api/medicines/check-safety', {
            method: 'POST',
            token: doctorToken,
            body: {
                patientId: 1, // Ramesh Kumar (has Penicillin allergy)
                medicineIds: [1, 2] // Warfarin + Aspirin
            }
        });
        assert(
            drugCheck.status === 200 &&
            drugCheck.data.interactions.length > 0 &&
            drugCheck.data.interactions[0].severity === 'major',
            'Drug Safety Engine flags Warfarin + Aspirin as MAJOR interaction'
        );

        // C. Allergy Conflict Check: Ramesh Kumar is allergic to Penicillin. Prescribing Novamox (id 4, Amoxicillin).
        const allergyCheck = await request('/api/medicines/check-safety', {
            method: 'POST',
            token: doctorToken,
            body: {
                patientId: 1,
                medicineIds: [4] // Amoxicillin
            }
        });
        assert(
            allergyCheck.status === 200 &&
            allergyCheck.data.allergyAlerts.length > 0 &&
            allergyCheck.data.allergyAlerts[0].allergen === 'Penicillin',
            'Drug Safety Engine alerts doctor on Penicillin allergy collision with Amoxicillin'
        );

        // D. Prescribing conflicting drugs without override is halted with 409 Conflict
        const conflictingRx = await request('/api/prescriptions', {
            method: 'POST',
            token: doctorToken,
            body: {
                patientId: 1,
                medicines: [
                    { medicineId: 1, dosage: '5mg', frequency: 'daily', duration: '10 days' },
                    { medicineId: 2, dosage: '75mg', frequency: 'daily', duration: '10 days' }
                ],
                forceOverride: false
            }
        });
        assert(
            conflictingRx.status === 409 && conflictingRx.data.isSafetyAlert === true,
            'Doctor prescription with dangerous interaction halted with HTTP 409 Safety Warning'
        );

        // E. Prescribing safe medicine succeeds
        const safeRx = await request('/api/prescriptions', {
            method: 'POST',
            token: doctorToken,
            body: {
                patientId: testPatientId,
                medicines: [
                    { medicineId: 8, dosage: '650mg', frequency: 'TDS (3 times/day)', duration: '3 days' }
                ]
            }
        });
        assert(safeRx.status === 201 && safeRx.data.prescriptionId, 'Doctor CAN create safe prescription (HTTP 201)');

        // 6. Admin Capabilities & Boundaries
        console.log('\n--- 5. Admin RBAC Checks ---');
        // Doctor CANNOT create staff account
        const docStaffCreate = await request('/api/admin/staff', {
            method: 'POST',
            token: doctorToken,
            body: { username: 'illegal_user', role: 'doctor' }
        });
        assert(docStaffCreate.status === 403, 'Doctor CANNOT create staff accounts (HTTP 403 Forbidden)');

        // Admin CAN inspect audit logs
        const auditLogs = await request('/api/admin/audit-logs', {
            method: 'GET',
            token: adminToken
        });
        assert(auditLogs.status === 200 && auditLogs.data.logs.length > 0, 'Admin CAN inspect audit trail (HTTP 200)');

        // 7. Appointment Scheduling Concurrency Test
        console.log('\n--- 6. Appointment Concurrency & Double-Booking Prevention ---');
        const bookingTime = '2026-11-15 10:00:00';
        const book1 = await request('/api/appointments', {
            method: 'POST',
            token: receptionToken,
            body: {
                patientId: 1,
                doctorId: 2,
                appointmentDatetime: bookingTime,
                reason: 'Follow-up 1'
            }
        });
        assert(book1.status === 201, 'First appointment slot booked successfully (HTTP 201)');

        // Try booking same doctor at the same time slot (+/- 14 mins)
        const book2 = await request('/api/appointments', {
            method: 'POST',
            token: receptionToken,
            body: {
                patientId: 2,
                doctorId: 2,
                appointmentDatetime: '2026-11-15 10:05:00',
                reason: 'Follow-up 2 (Conflict)'
            }
        });
        assert(book2.status === 409, 'Double-booking rejected with HTTP 409 Conflict');

    } catch (err) {
        console.error('Fatal test error:', err);
        failed++;
    } finally {
        if (server) server.close();
        await pool.end();
        console.log('\n========================================================');
        console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log('========================================================\n');
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
