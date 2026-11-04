import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { StatusBadge } from '../components/Badge';
import { 
    UserPlus, 
    Calendar, 
    Search, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight,
    Users
} from 'lucide-react';

export default function ReceptionistDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // New Patient Form State
    const [newPatient, setNewPatient] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        bloodGroup: 'B+',
        phone: '',
        email: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    // Booking Form State
    const [booking, setBooking] = useState({
        patientId: '',
        doctorId: '',
        appointmentDatetime: '',
        reason: ''
    });

    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'register' | 'book'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [appRes, docRes, patRes] = await Promise.all([
                apiRequest('/api/appointments'),
                apiRequest('/api/admin/staff?role=doctor'),
                apiRequest('/api/patients')
            ]);

            if (appRes.success) setAppointments(appRes.appointments);
            if (docRes.success) setDoctors(docRes.staff);
            if (patRes.success) setPatients(patRes.patients);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const res = await apiRequest('/api/patients', {
                method: 'POST',
                body: newPatient
            });
            if (res.success) {
                setMessage({ text: `Patient successfully registered! Assigned MRN: ${res.mrn}`, type: 'success' });
                // Reset form
                setNewPatient({
                    firstName: '',
                    lastName: '',
                    dateOfBirth: '',
                    gender: 'Male',
                    bloodGroup: 'B+',
                    phone: '',
                    email: '',
                    address: '',
                    emergencyContactName: '',
                    emergencyContactPhone: ''
                });
                loadData();
                setActiveTab('appointments');
            }
        } catch (err) {
            setMessage({ text: err.message || 'Registration failed.', type: 'error' });
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const res = await apiRequest('/api/appointments', {
                method: 'POST',
                body: booking
            });
            if (res.success) {
                setMessage({ text: 'Appointment booked successfully!', type: 'success' });
                setBooking({ patientId: '', doctorId: '', appointmentDatetime: '', reason: '' });
                loadData();
                setActiveTab('appointments');
            }
        } catch (err) {
            setMessage({ text: err.message || 'Failed to book appointment.', type: 'error' });
        }
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            const res = await apiRequest(`/api/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                body: { status: newStatus }
            });
            if (res.success) {
                setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, status: newStatus } : a));
            }
        } catch (err) {
            alert(err.message || 'Failed to update status');
        }
    };

    const filteredAppointments = appointments.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
            a.patient_first_name.toLowerCase().includes(query) ||
            a.patient_last_name.toLowerCase().includes(query) ||
            a.mrn.toLowerCase().includes(query) ||
            a.doctor_name.toLowerCase().includes(query)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Receptionist Desk</h1>
                    <p className="text-slate-500 text-sm">Patient intake, scheduling, and queue coordination</p>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Schedule List</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>New Patient</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('book')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'book' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Book Slot</span>
                    </button>
                </div>
            </div>

            {/* Notification Alert */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium border ${
                    message.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* TAB 1: Appointments List */}
            {activeTab === 'appointments' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-900">Hospital Consultation Queue ({filteredAppointments.length})</h2>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Search by patient, MRN, doctor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">Time & Date</th>
                                    <th className="px-6 py-3.5">Patient Details</th>
                                    <th className="px-6 py-3.5">Attending Doctor</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAppointments.map((app) => (
                                    <tr key={app.appointment_id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                                            {new Date(app.appointment_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/patients/${app.patient_id}`} className="font-bold text-blue-600 hover:underline">
                                                {app.patient_first_name} {app.patient_last_name}
                                            </Link>
                                            <span className="block text-xs text-slate-400">MRN: {app.mrn} | Tel: {app.patient_phone}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">{app.doctor_name}</span>
                                            <span className="block text-xs text-slate-500">{app.specialization || app.department_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {app.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(app.appointment_id, 'checked_in')}
                                                        className="px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg text-xs font-semibold"
                                                    >
                                                        Check In
                                                    </button>
                                                )}
                                                {app.status !== 'completed' && app.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(app.appointment_id, 'cancelled')}
                                                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <Link 
                                                    to={`/patients/${app.patient_id}`}
                                                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500"
                                                    title="View Full Profile"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-400">
                                            No appointments found. Click "Book Slot" to schedule one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: Register Patient */}
            {activeTab === 'register' && (
                <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 max-w-3xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Register New Patient</h2>
                            <p className="text-xs text-slate-500">Auto-generates Medical Record Number (MRN) upon submission</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreatePatient} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newPatient.firstName}
                                    onChange={e => setNewPatient({ ...newPatient, firstName: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newPatient.lastName}
                                    onChange={e => setNewPatient({ ...newPatient, lastName: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date of Birth *</label>
                                <input
                                    type="date"
                                    required
                                    value={newPatient.dateOfBirth}
                                    onChange={e => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender *</label>
                                <select
                                    value={newPatient.gender}
                                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group</label>
                                <select
                                    value={newPatient.bloodGroup}
                                    onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Phone Number *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="+91-9876543210"
                                    value={newPatient.phone}
                                    onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={newPatient.email}
                                    onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Residential Address</label>
                            <textarea
                                rows="2"
                                placeholder="Street, Area, City, Pin"
                                value={newPatient.address}
                                onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Contact Name</label>
                                <input
                                    type="text"
                                    placeholder="Spouse / Parent"
                                    value={newPatient.emergencyContactName}
                                    onChange={e => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Phone</label>
                                <input
                                    type="text"
                                    placeholder="+91-9876543211"
                                    value={newPatient.emergencyContactPhone}
                                    onChange={e => setNewPatient({ ...newPatient, emergencyContactPhone: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('appointments')}
                                className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md"
                            >
                                Register Patient & Issue MRN
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 3: Book Appointment */}
            {activeTab === 'book' && (
                <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 max-w-2xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Schedule Patient Consultation</h2>
                            <p className="text-xs text-slate-500">Database actively checks for double-booking concurrency conflicts</p>
                        </div>
                    </div>

                    <form onSubmit={handleBookAppointment} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Patient *</label>
                            <select
                                required
                                value={booking.patientId}
                                onChange={e => setBooking({ ...booking, patientId: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">-- Choose Patient --</option>
                                {patients.map(p => (
                                    <option key={p.patient_id} value={p.patient_id}>
                                        {p.first_name} {p.last_name} ({p.mrn}) - {p.phone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Doctor *</label>
                            <select
                                required
                                value={booking.doctorId}
                                onChange={e => setBooking({ ...booking, doctorId: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="">-- Choose Doctor --</option>
                                {doctors.map(d => (
                                    <option key={d.staff_id} value={d.staff_id}>
                                        {d.first_name} {d.last_name} ({d.specialization || d.department_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Appointment Date & Time *</label>
                            <input
                                type="datetime-local"
                                required
                                value={booking.appointmentDatetime}
                                onChange={e => setBooking({ ...booking, appointmentDatetime: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Visit</label>
                            <textarea
                                rows="2"
                                placeholder="Chief complaints, e.g., routine checkup, persistent cough"
                                value={booking.reason}
                                onChange={e => setBooking({ ...booking, reason: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('appointments')}
                                className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md"
                            >
                                Confirm Appointment
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
