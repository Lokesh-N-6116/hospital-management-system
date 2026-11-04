import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badge';
import { 
    Activity, 
    Users, 
    Calendar, 
    Pill, 
    Shield, 
    LogOut, 
    Stethoscope, 
    HeartPulse, 
    FileText 
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = {
        admin: [
            { label: 'System Overview', path: '/admin', icon: Shield },
            { label: 'Staff Accounts', path: '/admin/staff', icon: Users },
            { label: 'Audit Trail', path: '/admin/audit-logs', icon: FileText },
            { label: 'Drug Catalog', path: '/medicines', icon: Pill },
        ],
        doctor: [
            { label: 'Consultation Desk', path: '/doctor', icon: Stethoscope },
            { label: 'Patient Directory', path: '/patients', icon: Users },
            { label: 'Drug Interactions', path: '/medicines', icon: Pill },
        ],
        nurse: [
            { label: 'Nursing Station', path: '/nurse', icon: HeartPulse },
            { label: 'Patient Directory', path: '/patients', icon: Users },
            { label: 'Drug Catalog', path: '/medicines', icon: Pill },
        ],
        receptionist: [
            { label: 'Reception Desk', path: '/reception', icon: Calendar },
            { label: 'Patient Directory', path: '/patients', icon: Users },
        ]
    };

    const links = navLinks[user.role] || [];

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <div className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center space-x-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                                    CarePulse <span className="text-blue-600">HMS</span>
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                                    DBMS Project
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-1 ml-8">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User profile & Logout */}
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <div className="flex items-center justify-end space-x-2">
                                <span className="text-sm font-bold text-slate-800">{user.fullName}</span>
                                <RoleBadge role={user.role} />
                            </div>
                            <span className="text-xs text-slate-400 block">
                                {user.specialization || user.departmentName || user.email}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200"
                            title="Sign out of system"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
