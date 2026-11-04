import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { RoleBadge } from '../components/Badge';
import { 
    Shield, 
    Users, 
    FileText, 
    UserPlus, 
    Activity, 
    CheckCircle2, 
    XCircle, 
    Calendar, 
    Pill,
    Clock
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [staff, setStaff] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'staff' | 'audit' | 'createStaff'
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Create Staff Form
    const [newStaff, setNewStaff] = useState({
        username: '',
        email: '',
        password: 'password123',
        role: 'doctor',
        firstName: '',
        lastName: '',
        phone: '',
        departmentId: '',
        licenseNumber: '',
        specialization: ''
    });

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, staffRes, logsRes, deptRes] = await Promise.all([
                apiRequest('/api/admin/stats'),
                apiRequest('/api/admin/staff'),
                apiRequest('/api/admin/audit-logs'),
                apiRequest('/api/admin/departments')
            ]);

            if (statsRes.success) setStats(statsRes.stats);
            if (staffRes.success) setStaff(staffRes.staff);
            if (logsRes.success) setAuditLogs(logsRes.logs);
            if (deptRes.success) setDepartments(deptRes.departments);
        } catch (err) {
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            const res = await apiRequest('/api/admin/staff', {
                method: 'POST',
                body: newStaff
            });

            if (res.success) {
                setMessage({ text: `Staff account successfully provisioned for ${newStaff.firstName} ${newStaff.lastName}!`, type: 'success' });
                setNewStaff({
                    username: '',
                    email: '',
                    password: 'password123',
                    role: 'doctor',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    departmentId: '',
                    licenseNumber: '',
                    specialization: ''
                });
                loadAdminData();
                setActiveTab('staff');
            }
        } catch (err) {
            setMessage({ text: err.message || 'Failed to create staff account.', type: 'error' });
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const res = await apiRequest(`/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                body: { isActive: !currentStatus }
            });

            if (res.success) {
                setStaff(prev => prev.map(s => s.user_id === userId ? { ...s, is_active: !currentStatus } : s));
            }
        } catch (err) {
            alert(err.message || 'Failed to update user status');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Administration</h1>
                    <p className="text-slate-500 text-sm">Security auditing, role delegation, and hospital operational metrics</p>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'overview' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'staff' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        Staff Accounts ({staff.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('createStaff')}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'createStaff' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Staff</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            activeTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        Audit Trail
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium border ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{message.text}</span>
                </div>
            )}

            {/* TAB 1: Metric Overview */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                            <div className="p-3.5 bg-blue-100 text-blue-600 rounded-2xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Patients</span>
                                <h3 className="text-2xl font-black text-slate-900">{stats.totalPatients}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                            <div className="p-3.5 bg-indigo-100 text-indigo-600 rounded-2xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Appointments</span>
                                <h3 className="text-2xl font-black text-slate-900">{stats.totalAppointments}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                            <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-2xl">
                                <Pill className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Prescriptions</span>
                                <h3 className="text-2xl font-black text-slate-900">{stats.totalPrescriptions}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
                            <div className="p-3.5 bg-purple-100 text-purple-600 rounded-2xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff Profiles</span>
                                <h3 className="text-2xl font-black text-slate-900">{stats.totalStaff}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Recent Audit Activities */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-bold text-slate-900">Recent System Activity Stream</h2>
                        </div>

                        <div className="space-y-2.5">
                            {auditLogs.slice(0, 6).map(log => (
                                <div key={log.log_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                                            {log.action}
                                        </span>
                                        <span className="text-slate-700">{log.details || `Modified ${log.target_table} #${log.target_id}`}</span>
                                    </div>
                                    <div className="text-right text-slate-400">
                                        <span>User: <strong>{log.username || 'System'}</strong></span>
                                        <span className="ml-2 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Staff Accounts Directory */}
            {activeTab === 'staff' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Hospital Staff Directory</h2>
                        <button
                            onClick={() => setActiveTab('createStaff')}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Provision New Staff</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">Staff Member</th>
                                    <th className="px-6 py-3.5">Username / Email</th>
                                    <th className="px-6 py-3.5">Role</th>
                                    <th className="px-6 py-3.5">Department</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {staff.map(member => (
                                    <tr key={member.staff_id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 block">{member.first_name} {member.last_name}</span>
                                            <span className="text-xs text-slate-400">{member.specialization || member.license_number || 'General Staff'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-800 block">@{member.username}</span>
                                            <span className="text-xs text-slate-500">{member.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={member.role} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700">
                                            {member.department_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                member.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {member.is_active ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleStatus(member.user_id, member.is_active)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                                                    member.is_active
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                }`}
                                            >
                                                {member.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: Provision New Staff Form */}
            {activeTab === 'createStaff' && (
                <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 max-w-3xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Provision Staff Account</h2>
                            <p className="text-xs text-slate-500">Atomic creation of user login credentials and clinical staff profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateStaff} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. dr.mehta"
                                    value={newStaff.username}
                                    onChange={e => setNewStaff({ ...newStaff, username: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="doctor@hospital.local"
                                    value={newStaff.email}
                                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                                <input
                                    type="password"
                                    required
                                    value={newStaff.password}
                                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Designated Role *</label>
                                <select
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option value="doctor">Doctor (Full Prescribing & EHR)</option>
                                    <option value="nurse">Nurse (Triage & Vitals Logging)</option>
                                    <option value="receptionist">Receptionist (Scheduling & Intake)</option>
                                    <option value="admin">Administrator (System Security)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaff.firstName}
                                    onChange={e => setNewStaff({ ...newStaff, firstName: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaff.lastName}
                                    onChange={e => setNewStaff({ ...newStaff, lastName: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                                <select
                                    value={newStaff.departmentId}
                                    onChange={e => setNewStaff({ ...newStaff, departmentId: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option value="">-- None / General --</option>
                                    {departments.map(d => (
                                        <option key={d.department_id} value={d.department_id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+91-9876500000"
                                    value={newStaff.phone}
                                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medical License Number</label>
                                <input
                                    type="text"
                                    placeholder="MCI-12345"
                                    value={newStaff.licenseNumber}
                                    onChange={e => setNewStaff({ ...newStaff, licenseNumber: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialization / Designation</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Interventional Cardiologist"
                                    value={newStaff.specialization}
                                    onChange={e => setNewStaff({ ...newStaff, specialization: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('staff')}
                                className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md"
                            >
                                Provision Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 4: Audit Trail */}
            {activeTab === 'audit' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-bold text-slate-900">Security Audit Logs ({auditLogs.length})</h2>
                        </div>
                        <span className="text-xs text-slate-400">Read-Only Cryptographic Audit Trail</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Timestamp</th>
                                    <th className="px-5 py-3">Action</th>
                                    <th className="px-5 py-3">Initiated By</th>
                                    <th className="px-5 py-3">Table & Target ID</th>
                                    <th className="px-5 py-3">Details / Parameters</th>
                                    <th className="px-5 py-3">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                                {auditLogs.map(log => (
                                    <tr key={log.log_id} className="hover:bg-slate-50">
                                        <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-sans">
                                            <span className="font-bold text-slate-900">{log.username || 'System'}</span>
                                            <span className="text-[10px] text-slate-400 block">({log.role || 'daemon'})</span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            {log.target_table} #{log.target_id || '-'}
                                        </td>
                                        <td className="px-5 py-3 font-sans text-slate-600 max-w-xs truncate">
                                            {log.details || '-'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-400">
                                            {log.ip_address}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
