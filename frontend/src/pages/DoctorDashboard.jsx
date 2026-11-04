import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { StatusBadge, SeverityBadge } from '../components/Badge';
import DrugSafetyModal from '../components/DrugSafetyModal';
import { 
    Stethoscope, 
    FileText, 
    Pill, 
    Plus, 
    Trash2, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    User, 
    ShieldAlert 
} from 'lucide-react';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Clinical Note Form
    const [diagnosis, setDiagnosis] = useState({
        diagnosisTitle: '',
        symptoms: '',
        physicalExamination: '',
        treatmentPlan: ''
    });

    // Prescription Items Draft
    const [prescItems, setPrescItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        medicineId: '',
        dosage: '1 Tablet',
        frequency: 'Twice daily after meals',
        duration: '5 days',
        instructions: ''
    });

    // Safety Alert Modal State
    const [safetyModal, setSafetyModal] = useState({
        isOpen: false,
        interactions: [],
        allergyAlerts: []
    });

    // Live safety warning banner state
    const [liveSafetyState, setLiveSafetyState] = useState({
        hasRisk: false,
        interactions: [],
        allergyAlerts: []
    });

    useEffect(() => {
        loadDoctorData();
    }, [user]);

    const loadDoctorData = async () => {
        try {
            setLoading(true);
            const [appRes, medRes] = await Promise.all([
                apiRequest(`/api/appointments?doctorId=${user.staffId || ''}`),
                apiRequest('/api/medicines')
            ]);

            if (appRes.success) setAppointments(appRes.appointments);
            if (medRes.success) setMedicines(medRes.medicines);

            // Default select first patient in queue if present
            if (appRes.appointments && appRes.appointments.length > 0) {
                handleSelectPatient(appRes.appointments[0].patient_id);
            }
        } catch (err) {
            console.error('Error loading doctor data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = async (patientId) => {
        try {
            const res = await apiRequest(`/api/patients/${patientId}`);
            if (res.success) {
                setSelectedPatient(patientId);
                setPatientDetails(res);
                // Clear prescription items on patient change
                setPrescItems([]);
                setLiveSafetyState({ hasRisk: false, interactions: [], allergyAlerts: [] });
            }
        } catch (err) {
            console.error('Error loading patient details:', err);
        }
    };

    // Trigger live drug safety check whenever prescription items change
    useEffect(() => {
        async function runLiveCheck() {
            if (!selectedPatient || prescItems.length === 0) {
                setLiveSafetyState({ hasRisk: false, interactions: [], allergyAlerts: [] });
                return;
            }

            try {
                const medIds = prescItems.map(p => p.medicineId);
                const res = await apiRequest('/api/medicines/check-safety', {
                    method: 'POST',
                    body: {
                        patientId: selectedPatient,
                        medicineIds: medIds
                    }
                });

                if (res.success) {
                    setLiveSafetyState({
                        hasRisk: !res.isSafe,
                        interactions: res.interactions || [],
                        allergyAlerts: res.allergyAlerts || []
                    });
                }
            } catch (err) {
                console.error('Error running live safety check:', err);
            }
        }

        runLiveCheck();
    }, [prescItems, selectedPatient]);

    const handleAddMedicineItem = () => {
        if (!currentItem.medicineId) {
            alert('Please select a medicine.');
            return;
        }

        const medObj = medicines.find(m => m.medicine_id === parseInt(currentItem.medicineId, 10));
        if (!medObj) return;

        // Prevent duplicate items
        if (prescItems.some(i => i.medicineId === medObj.medicine_id)) {
            alert('This medicine is already added to the prescription draft.');
            return;
        }

        setPrescItems([
            ...prescItems,
            {
                medicineId: medObj.medicine_id,
                name: medObj.name,
                genericName: medObj.generic_name,
                category: medObj.category,
                dosage: currentItem.dosage,
                frequency: currentItem.frequency,
                duration: currentItem.duration,
                instructions: currentItem.instructions
            }
        ]);

        // Reset current item selector
        setCurrentItem({
            medicineId: '',
            dosage: '1 Tablet',
            frequency: 'Twice daily after meals',
            duration: '5 days',
            instructions: ''
        });
    };

    const handleRemoveMedicineItem = (medId) => {
        setPrescItems(prev => prev.filter(item => item.medicineId !== medId));
    };

    const handleSubmitConsultation = async (overrideWarning = false) => {
        setMessage({ text: '', type: '' });
        setSubmitting(true);

        try {
            let recordId = null;

            // 1. Save Clinical Diagnosis Record if title provided
            if (diagnosis.diagnosisTitle.trim()) {
                const diagRes = await apiRequest('/api/clinical/records', {
                    method: 'POST',
                    body: {
                        patientId: selectedPatient,
                        diagnosisTitle: diagnosis.diagnosisTitle,
                        symptoms: diagnosis.symptoms,
                        physicalExamination: diagnosis.physicalExamination,
                        treatmentPlan: diagnosis.treatmentPlan
                    }
                });
                if (diagRes.success) recordId = diagRes.recordId;
            }

            // 2. Save Prescription if items present
            if (prescItems.length > 0) {
                const prescRes = await apiRequest('/api/prescriptions', {
                    method: 'POST',
                    body: {
                        patientId: selectedPatient,
                        recordId: recordId,
                        instructions: diagnosis.treatmentPlan || 'Take medications as directed',
                        medicines: prescItems.map(p => ({
                            medicineId: p.medicineId,
                            dosage: p.dosage,
                            frequency: p.frequency,
                            duration: p.duration,
                            instructions: p.instructions
                        })),
                        forceOverride: overrideWarning
                    }
                });

                if (prescRes.success) {
                    setMessage({
                        text: `Consultation & Prescription saved successfully! (Prescription #${prescRes.prescriptionId})`,
                        type: 'success'
                    });
                }
            } else if (recordId) {
                setMessage({ text: 'Clinical diagnosis note saved successfully!', type: 'success' });
            }

            // Close modal if open, reset form, reload patient EHR
            setSafetyModal({ isOpen: false, interactions: [], allergyAlerts: [] });
            setDiagnosis({ diagnosisTitle: '', symptoms: '', physicalExamination: '', treatmentPlan: '' });
            setPrescItems([]);
            if (selectedPatient) handleSelectPatient(selectedPatient);

        } catch (err) {
            // Check if backend rejected due to unconfirmed drug safety alert
            if (err.data && err.data.isSafetyAlert) {
                setSafetyModal({
                    isOpen: true,
                    interactions: err.data.interactions || [],
                    allergyAlerts: err.data.allergyAlerts || []
                });
            } else {
                setMessage({ text: err.message || 'Error saving consultation.', type: 'error' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivatePrescription = async (prescId) => {
        if (!window.confirm('Are you sure you want to discontinue/deactivate this prescription?')) return;
        try {
            const res = await apiRequest(`/api/prescriptions/${prescId}/deactivate`, {
                method: 'PATCH',
                body: { reason: 'Discontinued by physician' }
            });
            if (res.success) {
                if (selectedPatient) handleSelectPatient(selectedPatient);
            }
        } catch (err) {
            alert(err.message || 'Failed to deactivate prescription');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Physician Consultation Desk</h1>
                    <p className="text-slate-500 text-sm">
                        Welcome, <span className="font-semibold text-slate-800">{user.fullName}</span> ({user.specialization || 'Attending Physician'})
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span>Prescribing Authority: Active</span>
                    </span>
                </div>
            </div>

            {/* Notification alert */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium border ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: Patient Queue */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>Today's Consultation Queue</span>
                            </h2>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {appointments.length}
                            </span>
                        </div>

                        <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
                            {appointments.map(app => (
                                <button
                                    key={app.appointment_id}
                                    onClick={() => handleSelectPatient(app.patient_id)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col space-y-1.5 ${
                                        selectedPatient === app.patient_id
                                            ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400'
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
                                        <span>{new Date(app.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {app.reason && (
                                        <p className="text-xs text-slate-600 truncate italic">"{app.reason}"</p>
                                    )}
                                </button>
                            ))}
                            {appointments.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-6">No scheduled consultations for today.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Patient Clinical Workspace */}
                <div className="lg:col-span-8 space-y-6">
                    {patientDetails ? (
                        <>
                            {/* Patient Demographics & Allergy Banner */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <h2 className="text-xl font-bold text-slate-900">
                                                {patientDetails.patient.first_name} {patientDetails.patient.last_name}
                                            </h2>
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                                                {patientDetails.patient.mrn}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            DOB: {patientDetails.patient.date_of_birth} | Gender: {patientDetails.patient.gender} | Blood: {patientDetails.patient.blood_group || 'Unknown'} | Tel: {patientDetails.patient.phone}
                                        </p>
                                    </div>

                                    <Link 
                                        to={`/patients/${patientDetails.patient.patient_id}`}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                    >
                                        View Full EHR Timeline →
                                    </Link>
                                </div>

                                {/* CRITICAL: Recorded Allergies */}
                                {patientDetails.allergies && patientDetails.allergies.length > 0 ? (
                                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                                                Documented Allergies ({patientDetails.allergies.length})
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {patientDetails.allergies.map(al => (
                                                    <span key={al.allergy_id} className="text-xs bg-white px-2.5 py-1 rounded-md border border-rose-300 text-rose-800 font-semibold shadow-2xs">
                                                        {al.allergen} ({al.severity}): {al.reaction || 'Hypersensitivity'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                                        No known drug or environmental allergies recorded.
                                    </div>
                                )}

                                {/* Latest Vitals recorded by Nurse */}
                                {patientDetails.vitals && patientDetails.vitals.length > 0 && (
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Latest Nurse Vitals ({new Date(patientDetails.vitals[0].recorded_at).toLocaleDateString()})
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                                                <span className="font-bold text-slate-800">{patientDetails.vitals[0].systolic_bp}/{patientDetails.vitals[0].diastolic_bp} mmHg</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 block text-[10px]">Heart Rate</span>
                                                <span className="font-bold text-slate-800">{patientDetails.vitals[0].heart_rate} bpm</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 block text-[10px]">Temp</span>
                                                <span className="font-bold text-slate-800">{patientDetails.vitals[0].temperature_celsius} °C</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 block text-[10px]">Resp. Rate</span>
                                                <span className="font-bold text-slate-800">{patientDetails.vitals[0].respiratory_rate} /min</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                <span className="text-slate-400 block text-[10px]">SpO2 Sat</span>
                                                <span className="font-bold text-slate-800">{patientDetails.vitals[0].oxygen_saturation}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 1: Clinical Diagnosis Note */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-base font-bold text-slate-900">Clinical Diagnosis & Findings</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Diagnosis Title *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Essential Hypertension, Acute Bronchitis"
                                            value={diagnosis.diagnosisTitle}
                                            onChange={e => setDiagnosis({ ...diagnosis, diagnosisTitle: e.target.value })}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                                Subjective Symptoms
                                            </label>
                                            <textarea
                                                rows="2"
                                                placeholder="Patient chief complaints and duration..."
                                                value={diagnosis.symptoms}
                                                onChange={e => setDiagnosis({ ...diagnosis, symptoms: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                                Physical Exam & Signs
                                            </label>
                                            <textarea
                                                rows="2"
                                                placeholder="Chest, heart sounds, abdominal findings..."
                                                value={diagnosis.physicalExamination}
                                                onChange={e => setDiagnosis({ ...diagnosis, physicalExamination: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Prescription Composer with Real-time Drug Safety */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center space-x-2">
                                        <Pill className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-base font-bold text-slate-900">Prescription Composer</h3>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">
                                        Powered by Drug-Drug Interaction Safety Engine
                                    </span>
                                </div>

                                {/* Live Safety Warning Banner */}
                                {liveSafetyState.hasRisk && (
                                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                                                    Clinical Safety Alert: Potential Conflicts Detected
                                                </h4>
                                                <p className="text-xs text-amber-800">
                                                    {liveSafetyState.interactions.length} drug-drug interaction(s), {liveSafetyState.allergyAlerts.length} allergy collision(s).
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSafetyModal({
                                                isOpen: true,
                                                interactions: liveSafetyState.interactions,
                                                allergyAlerts: liveSafetyState.allergyAlerts
                                            })}
                                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap"
                                        >
                                            Inspect Hazard Details
                                        </button>
                                    </div>
                                )}

                                {/* Medicine Line Item Adder */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Medication *</label>
                                            <select
                                                value={currentItem.medicineId}
                                                onChange={e => setCurrentItem({ ...currentItem, medicineId: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">-- Choose Medicine --</option>
                                                {medicines.map(m => (
                                                    <option key={m.medicine_id} value={m.medicine_id}>
                                                        {m.name} ({m.generic_name}) - {m.strength} [{m.category}]
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Dosage Form & Strength</label>
                                            <input
                                                type="text"
                                                value={currentItem.dosage}
                                                onChange={e => setCurrentItem({ ...currentItem, dosage: e.target.value })}
                                                placeholder="e.g. 1 Tablet (50mg)"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Frequency</label>
                                            <input
                                                type="text"
                                                value={currentItem.frequency}
                                                onChange={e => setCurrentItem({ ...currentItem, frequency: e.target.value })}
                                                placeholder="e.g. Once daily morning"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Duration</label>
                                            <input
                                                type="text"
                                                value={currentItem.duration}
                                                onChange={e => setCurrentItem({ ...currentItem, duration: e.target.value })}
                                                placeholder="e.g. 7 days"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={handleAddMedicineItem}
                                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-sm transition"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Add Line Item</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Prescribed Medicines Table Draft */}
                                {prescItems.length > 0 && (
                                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                        <table className="w-full text-left text-xs text-slate-600">
                                            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-2.5">Medication Name</th>
                                                    <th className="px-4 py-2.5">Dosage</th>
                                                    <th className="px-4 py-2.5">Frequency</th>
                                                    <th className="px-4 py-2.5">Duration</th>
                                                    <th className="px-4 py-2.5 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {prescItems.map(item => (
                                                    <tr key={item.medicineId} className="hover:bg-slate-50">
                                                        <td className="px-4 py-2.5">
                                                            <span className="font-bold text-slate-900">{item.name}</span>
                                                            <span className="block text-[10px] text-slate-400">{item.genericName} ({item.category})</span>
                                                        </td>
                                                        <td className="px-4 py-2.5 font-medium">{item.dosage}</td>
                                                        <td className="px-4 py-2.5">{item.frequency}</td>
                                                        <td className="px-4 py-2.5">{item.duration}</td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveMedicineItem(item.medicineId)}
                                                                className="text-rose-600 hover:text-rose-800 p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Overall Treatment Plan / Advice */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Physician Treatment Advice & Dietary Guidelines
                                    </label>
                                    <textarea
                                        rows="2"
                                        placeholder="e.g. Low salt diet, drink 3L water daily, review in clinic after 2 weeks"
                                        value={diagnosis.treatmentPlan}
                                        onChange={e => setDiagnosis({ ...diagnosis, treatmentPlan: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    ></textarea>
                                </div>

                                {/* Submit Consultation Action */}
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        disabled={submitting || (!diagnosis.diagnosisTitle.trim() && prescItems.length === 0)}
                                        onClick={() => handleSubmitConsultation(false)}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50 transition flex items-center space-x-2"
                                    >
                                        <Stethoscope className="w-4 h-4" />
                                        <span>{submitting ? 'Finalizing...' : 'Finalize & Commit Consultation'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Section 3: Patient's Active & Past Prescriptions */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                                    Active & Past Prescriptions
                                </h3>

                                <div className="space-y-3">
                                    {patientDetails.prescriptions && patientDetails.prescriptions.map(p => (
                                        <div key={p.prescription_id} className={`p-4 rounded-xl border ${p.is_active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-sm text-slate-800">Prescription #{p.prescription_id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                                        {p.is_active ? 'ACTIVE' : 'DISCONTINUED'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs text-slate-500">
                                                    <span>{new Date(p.prescription_date).toLocaleDateString()}</span>
                                                    {p.is_active && (
                                                        <button
                                                            onClick={() => handleDeactivatePrescription(p.prescription_id)}
                                                            className="text-xs text-rose-600 font-semibold hover:underline ml-2"
                                                        >
                                                            Discontinue
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {p.items && (
                                                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                                                    {p.items.map(item => (
                                                        <li key={item.item_id}>
                                                            <span className="font-semibold">{item.name}</span> ({item.dosage}) – {item.frequency} for {item.duration}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                    {(!patientDetails.prescriptions || patientDetails.prescriptions.length === 0) && (
                                        <p className="text-xs text-slate-400">No previous prescriptions on file.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl shadow-xs border border-slate-200 text-center text-slate-400">
                            <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-medium">Select a patient from the queue to start consultation.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Drug Safety Alert Modal */}
            <DrugSafetyModal
                isOpen={safetyModal.isOpen}
                onClose={() => setSafetyModal({ isOpen: false, interactions: [], allergyAlerts: [] })}
                onConfirmOverride={() => handleSubmitConsultation(true)}
                interactions={safetyModal.interactions}
                allergyAlerts={safetyModal.allergyAlerts}
            />
        </div>
    );
}
