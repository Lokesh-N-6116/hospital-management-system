import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { StatusBadge } from '../components/Badge';
import { 
    HeartPulse, 
    Activity, 
    CheckCircle2, 
    AlertTriangle, 
    Clock, 
    Pill, 
    ChevronRight,
    UserCheck
} from 'lucide-react';

export default function NurseDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '', warning: '' });

    // Vitals Entry Form State
    const [vitals, setVitals] = useState({
        systolicBp: 120,
        diastolicBp: 80,
        heartRate: 75,
        temperatureCelsius: 37.0,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        notes: ''
    });

    useEffect(() => {
        loadNurseData();
    }, []);

    const loadNurseData = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/api/appointments');
            if (res.success) {
                setAppointments(res.appointments);
                if (res.appointments.length > 0) {
                    handleSelectPatient(res.appointments[0].patient_id);
                }
            }
        } catch (err) {
            console.error('Error loading nurse data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = async (patientId) => {
        try {
            const res = await apiRequest(`/api/patients/${patientId}`);
            if (res.success) {
                setSelectedPatientId(patientId);
                setPatientData(res);
                setMessage({ text: '', type: '', warning: '' });
            }
        } catch (err) {
            console.error('Error fetching patient:', err);
        }
    };

    const handleRecordVitals = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '', warning: '' });

        try {
            const res = await apiRequest('/api/vitals', {
                method: 'POST',
                body: {
                    patientId: selectedPatientId,
                    systolicBp: parseInt(vitals.systolicBp, 10),
                    diastolicBp: parseInt(vitals.diastolicBp, 10),
                    heartRate: parseInt(vitals.heartRate, 10),
                    temperatureCelsius: parseFloat(vitals.temperatureCelsius),
                    respiratoryRate: parseInt(vitals.respiratoryRate, 10),
                    oxygenSaturation: parseInt(vitals.oxygenSaturation, 10),
                    notes: vitals.notes
                }
            });

            if (res.success) {
                setMessage({
                    text: 'Patient vital signs successfully recorded and appended to medical history.',
                    type: 'success',
                    warning: res.warning
                });
                // Reload patient data to reflect new vitals
                handleSelectPatient(selectedPatientId);
            }
        } catch (err) {
            setMessage({ text: err.message || 'Failed to record vitals.', type: 'error' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nursing Triage Station</h1>
                    <p className="text-slate-500 text-sm">
                        Welcome, <span className="font-semibold text-slate-800">{user.fullName}</span> (Clinical Nurse)
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Triage & Vitals Logging: Authorized</span>
                    </span>
                </div>
            </div>

            {/* Notification alert */}
            {message.text && (
                <div className="space-y-2">
                    <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium border ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                        <span>{message.text}</span>
                    </div>

                    {message.warning && (
                        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-3 text-sm font-bold text-amber-900">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>{message.warning}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: Inpatient & Scheduled Queue */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                <span>Patient Rounds Queue</span>
                            </h2>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {appointments.length}
                            </span>
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {appointments.map(app => (
                                <button
                                    key={app.appointment_id}
                                    onClick={() => handleSelectPatient(app.patient_id)}
                                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col space-y-1 ${
                                        selectedPatientId === app.patient_id
                                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-slate-900">
                                            {app.patient_first_name} {app.patient_last_name}
                                        </span>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>MRN: {app.mrn}</span>
                                        <span>Dr. {app.doctor_name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Vitals Entry & Read-Only Prescriptions */}
                <div className="lg:col-span-8 space-y-6">
                    {patientData ? (
                        <>
                            {/* Patient Demographics & Allergy Summary */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {patientData.patient.first_name} {patientData.patient.last_name}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            MRN: {patientData.patient.mrn} | Blood: {patientData.patient.blood_group} | DOB: {patientData.patient.date_of_birth}
                                        </p>
                                    </div>
                                    <Link to={`/patients/${selectedPatientId}`} className="text-xs font-semibold text-emerald-700 hover:underline">
                                        Open Full Record →
                                    </Link>
                                </div>

                                {patientData.allergies && patientData.allergies.length > 0 && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                                        <strong>Active Allergies:</strong> {patientData.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Section 1: Record Vitals Form */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-base font-bold text-slate-900">Record Physiological Vital Signs</h3>
                                </div>

                                <form onSubmit={handleRecordVitals} className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Systolic BP (mmHg) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="50"
                                                max="260"
                                                value={vitals.systolicBp}
                                                onChange={e => setVitals({ ...vitals, systolicBp: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Diastolic BP (mmHg) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="30"
                                                max="160"
                                                value={vitals.diastolicBp}
                                                onChange={e => setVitals({ ...vitals, diastolicBp: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Heart Rate (bpm) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="30"
                                                max="220"
                                                value={vitals.heartRate}
                                                onChange={e => setVitals({ ...vitals, heartRate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Body Temp (°C) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                required
                                                min="34"
                                                max="43"
                                                value={vitals.temperatureCelsius}
                                                onChange={e => setVitals({ ...vitals, temperatureCelsius: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Oxygen Sat (SpO2 %) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="50"
                                                max="100"
                                                value={vitals.oxygenSaturation}
                                                onChange={e => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Resp. Rate (/min)
                                            </label>
                                            <input
                                                type="number"
                                                min="8"
                                                max="60"
                                                value={vitals.respiratoryRate}
                                                onChange={e => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                            Nursing Triage Notes / Behavioral Observations
                                        </label>
                                        <textarea
                                            rows="2"
                                            placeholder="Patient alert, oriented, reporting dizziness, etc."
                                            value={vitals.notes}
                                            onChange={e => setVitals({ ...vitals, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                        ></textarea>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                                        >
                                            Commit Vitals Record
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Section 2: READ-ONLY Prescriptions & Medication Administration View */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center space-x-2">
                                        <Pill className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-base font-bold text-slate-900">
                                            Doctor Prescriptions (Read-Only Care Plan)
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                        Strict RBAC: Nurses cannot modify or delete prescriptions
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {patientData.prescriptions && patientData.prescriptions.map(p => (
                                        <div key={p.prescription_id} className={`p-4 rounded-xl border ${p.is_active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <span className="font-bold text-sm text-slate-800">Prescription #{p.prescription_id}</span>
                                                    <span className="text-xs text-slate-500 ml-2">Authored by: Dr. {p.doctor_name}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                                    {p.is_active ? 'ACTIVE' : 'DISCONTINUED'}
                                                </span>
                                            </div>

                                            {p.items && (
                                                <div className="overflow-x-auto mt-2">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                                                            <tr>
                                                                <th className="px-3 py-2">Medication</th>
                                                                <th className="px-3 py-2">Dosage</th>
                                                                <th className="px-3 py-2">Frequency</th>
                                                                <th className="px-3 py-2">Duration</th>
                                                                <th className="px-3 py-2">Instructions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {p.items.map(item => (
                                                                <tr key={item.item_id}>
                                                                    <td className="px-3 py-2 font-bold text-slate-800">{item.name}</td>
                                                                    <td className="px-3 py-2">{item.dosage}</td>
                                                                    <td className="px-3 py-2 font-semibold text-emerald-800">{item.frequency}</td>
                                                                    <td className="px-3 py-2">{item.duration}</td>
                                                                    <td className="px-3 py-2 text-slate-500">{item.instructions || 'As advised'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!patientData.prescriptions || patientData.prescriptions.length === 0) && (
                                        <p className="text-xs text-slate-400">No prescriptions on file for this patient.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl shadow-xs border border-slate-200 text-center text-slate-400">
                            Select a patient from the rounds queue to begin vitals triage.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
