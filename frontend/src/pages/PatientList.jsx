import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { Users, Search, ChevronRight, UserPlus, FileText } from 'lucide-react';

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, [search]);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const res = await apiRequest(`/api/patients?search=${encodeURIComponent(search)}`);
            if (res.success) {
                setPatients(res.patients);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
                    <p className="text-slate-500 text-sm">Centralized repository of registered patient electronic health records</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Search by name, MRN, phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">MRN</th>
                                <th className="px-6 py-3.5">Patient Name</th>
                                <th className="px-6 py-3.5">DOB / Age</th>
                                <th className="px-6 py-3.5">Gender</th>
                                <th className="px-6 py-3.5">Blood Group</th>
                                <th className="px-6 py-3.5">Phone</th>
                                <th className="px-6 py-3.5 text-right">EHR Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.map(p => (
                                <tr key={p.patient_id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                                        {p.mrn}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/patients/${p.patient_id}`} className="font-bold text-slate-900 hover:text-blue-600">
                                            {p.first_name} {p.last_name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{p.date_of_birth}</td>
                                    <td className="px-6 py-4 text-xs">{p.gender}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-rose-600">{p.blood_group || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-xs text-slate-700">{p.phone}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/patients/${p.patient_id}`}
                                            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Timeline</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        No patients matched your query.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
