import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { StatusBadge, SeverityBadge } from '../components/Badge';
import { 
    User, 
    Calendar, 
    Activity, 
    FileText, 
    Pill, 
    AlertTriangle, 
    Plus, 
    ArrowLeft, 
    Clock, 
    Upload, 
    File 
} from 'lucide-react';

export default function PatientDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add Allergy Modal / Form State
    const [showAllergyForm, setShowAllergyForm] = useState(false);
    const [newAllergy, setNewAllergy] = useState({
        allergen: '',
        reaction: '',
        severity: 'moderate',
        notes: ''
    });

    useEffect(() => {
        loadPatientProfile();
    }, [id]);

    const loadPatientProfile = async () => {
        try {
            setLoading(true);
            const res = await apiRequest(`/api/patients/${id}`);
            if (res.success) {
                setData(res);
            }
        } catch (err) {
            setError(err.message || 'Failed to load patient record.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAllergy = async (e) => {
        e.preventDefault();
        try {
            const res = await apiRequest(`/api/patients/${id}/allergies`, {
                method: 'POST',
                body: newAllergy
            });
            if (res.success) {
                setShowAllergyForm(false);
                setNewAllergy({ allergen: '', reaction: '', severity: 'moderate', notes: '' });
                loadPatientProfile();
            }
        } catch (err) {
            alert(err.message || 'Failed to add allergy');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
                    <p className="font-bold text-lg">{error || 'Patient not found'}</p>
                    <Link to="/patients" className="mt-4 inline-block text-sm text-blue-600 font-semibold underline">
                        Back to Patient Directory
                    </Link>
                </div>
            </div>
        );
    }

    const { patient, allergies, vitals, appointments, records, prescriptions, reports } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link to={user.role === 'doctor' ? '/doctor' : user.role === 'nurse' ? '/nurse' : '/reception'} className="flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Workstation</span>
                </Link>
            </div>

            {/* Demographics Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                            {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-black text-slate-900">{patient.first_name} {patient.last_name}</h1>
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-mono text-xs font-bold">
                                    {patient.mrn}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Registered On: {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">DOB (Age)</span>
                            <span className="font-bold text-slate-800">{patient.date_of_birth}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                            <span className="font-bold text-slate-800">{patient.gender}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                            <span className="font-bold text-rose-600">{patient.blood_group || 'Unknown'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                            <span className="font-bold text-slate-800">{patient.phone}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div>
                        <span className="font-bold text-slate-800 block">Residential Address:</span>
                        <span>{patient.address || 'No address provided.'}</span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 block">Emergency Contact:</span>
                        <span>{patient.emergency_contact_name || 'N/A'} ({patient.emergency_contact_phone || 'N/A'})</span>
                    </div>
                </div>
            </div>

            {/* Allergies Section */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        <h2 className="text-base font-bold text-slate-900">Recorded Allergies ({allergies.length})</h2>
                    </div>

                    {(user.role === 'doctor' || user.role === 'nurse') && (
                        <button
                            onClick={() => setShowAllergyForm(!showAllergyForm)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Allergy</span>
                        </button>
                    )}
                </div>

                {showAllergyForm && (
                    <form onSubmit={handleAddAllergy} className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Allergen *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Penicillin, Peanuts"
                                    value={newAllergy.allergen}
                                    onChange={e => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Severity *</label>
                                <select
                                    value={newAllergy.severity}
                                    onChange={e => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                                >
                                    <option value="mild">Mild</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 uppercase mb-1">Clinical Reaction</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Hives, Anaphylaxis"
                                    value={newAllergy.reaction}
                                    onChange={e => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAllergyForm(false)}
                                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold"
                            >
                                Save Allergy
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {allergies.map(a => (
                        <div key={a.allergy_id} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-rose-900">{a.allergen}</span>
                                <SeverityBadge severity={a.severity} />
                            </div>
                            <p className="text-xs text-rose-800">{a.reaction || 'Hypersensitivity reaction'}</p>
                            {a.notes && <p className="text-[11px] text-rose-600 italic">"{a.notes}"</p>}
                        </div>
                    ))}
                    {allergies.length === 0 && (
                        <p className="text-xs text-slate-400 py-2">No known drug or environmental allergies recorded.</p>
                    )}
                </div>
            </div>

            {/* Vitals History Table */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900">Physiological Vitals History ({vitals.length})</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500">
                            <tr>
                                <th className="px-4 py-2.5">Date & Time</th>
                                <th className="px-4 py-2.5">Blood Pressure</th>
                                <th className="px-4 py-2.5">Heart Rate</th>
                                <th className="px-4 py-2.5">Temp (°C)</th>
                                <th className="px-4 py-2.5">SpO2 %</th>
                                <th className="px-4 py-2.5">Nurse</th>
                                <th className="px-4 py-2.5">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vitals.map(v => (
                                <tr key={v.vitals_id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                                        {new Date(v.recorded_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td className="px-4 py-2.5 font-bold text-slate-800">{v.systolic_bp}/{v.diastolic_bp} mmHg</td>
                                    <td className="px-4 py-2.5">{v.heart_rate} bpm</td>
                                    <td className="px-4 py-2.5">{v.temperature_celsius} °C</td>
                                    <td className="px-4 py-2.5 font-bold text-emerald-700">{v.oxygen_saturation}%</td>
                                    <td className="px-4 py-2.5 text-slate-500">{v.recorded_by_nurse_name}</td>
                                    <td className="px-4 py-2.5 italic text-slate-500">{v.notes || '-'}</td>
                                </tr>
                            ))}
                            {vitals.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-slate-400">No vitals entries on file.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Medical Records (Diagnoses) */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">Clinical Diagnoses & Consultation Notes ({records.length})</h2>
                </div>

                <div className="space-y-4">
                    {records.map(r => (
                        <div key={r.record_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-900">{r.diagnosis_title}</h3>
                                <span className="text-slate-400">{new Date(r.record_date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-500">Consultant: <strong>Dr. {r.doctor_name}</strong> ({r.specialization || 'Attending Physician'})</p>
                            {r.symptoms && <p className="text-slate-700"><strong>Symptoms:</strong> {r.symptoms}</p>}
                            {r.physical_examination && <p className="text-slate-700"><strong>Physical Findings:</strong> {r.physical_examination}</p>}
                            {r.treatment_plan && (
                                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium mt-1">
                                    <strong>Treatment Plan:</strong> {r.treatment_plan}
                                </div>
                            )}
                        </div>
                    ))}
                    {records.length === 0 && (
                        <p className="text-xs text-slate-400 py-2">No clinical diagnosis records found.</p>
                    )}
                </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Pill className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-base font-bold text-slate-900">Prescription Records ({prescriptions.length})</h2>
                </div>

                <div className="space-y-3">
                    {prescriptions.map(p => (
                        <div key={p.prescription_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-slate-800">Prescription #{p.prescription_id} - Dr. {p.doctor_name}</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {p.is_active ? 'ACTIVE' : 'DISCONTINUED'}
                                </span>
                            </div>

                            {p.items && (
                                <ul className="space-y-1 list-disc list-inside text-slate-700">
                                    {p.items.map(i => (
                                        <li key={i.item_id}>
                                            <span className="font-bold">{i.name}</span> ({i.dosage}) – {i.frequency} for {i.duration} [{i.instructions || 'Standard'}]
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagnostic Reports */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <File className="w-5 h-5 text-amber-600" />
                    <h2 className="text-base font-bold text-slate-900">Diagnostic Reports & Scans ({reports.length})</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reports.map(rep => (
                        <div key={rep.report_id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-slate-900">{rep.report_title}</span>
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">{rep.report_type}</span>
                            </div>
                            <p className="text-slate-500">Date: {rep.report_date} | By: {rep.uploaded_by_username}</p>
                            {rep.summary_notes && <p className="text-slate-700 italic">"{rep.summary_notes}"</p>}
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <p className="text-xs text-slate-400 py-2">No uploaded lab reports found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
