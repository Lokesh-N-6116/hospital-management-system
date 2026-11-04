import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, ArrowRight, Shield, Stethoscope, HeartPulse, Calendar } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(username, password);
            redirectByRole(user.role);
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please verify username and password.');
        } finally {
            setLoading(false);
        }
    };

    const redirectByRole = (role) => {
        switch (role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'doctor':
                navigate('/doctor');
                break;
            case 'nurse':
                navigate('/nurse');
                break;
            case 'receptionist':
                navigate('/reception');
                break;
            default:
                navigate('/');
        }
    };

    const handleQuickLogin = async (userVal, passVal) => {
        setUsername(userVal);
        setPassword(passVal);
        setError('');
        setLoading(true);
        try {
            const user = await login(userVal, passVal);
            redirectByRole(user.role);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20 mb-4">
                    <Activity className="w-9 h-9" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                    CarePulse <span className="text-blue-400">HMS</span>
                </h2>
                <p className="mt-2 text-sm text-slate-400 font-medium">
                    Clinical Hospital Management & Drug Safety System
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Username or Email
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. dr.sharma, admin"
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Role Switcher */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                            Quick Switch for Demonstration & Viva
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('dr.sharma', 'password123')}
                                className="flex items-center space-x-2 p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition group"
                            >
                                <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="truncate">
                                    <p className="text-xs font-bold text-blue-900 leading-tight">Doctor</p>
                                    <p className="text-[10px] text-blue-700 truncate">Dr. Rajesh Sharma</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('nurse.mary', 'password123')}
                                className="flex items-center space-x-2 p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition group"
                            >
                                <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="truncate">
                                    <p className="text-xs font-bold text-emerald-900 leading-tight">Nurse</p>
                                    <p className="text-[10px] text-emerald-700 truncate">Nurse Mary Joseph</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('reception.rahul', 'password123')}
                                className="flex items-center space-x-2 p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition group"
                            >
                                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                                <div className="truncate">
                                    <p className="text-xs font-bold text-amber-900 leading-tight">Receptionist</p>
                                    <p className="text-[10px] text-amber-700 truncate">Rahul Verma</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickLogin('admin', 'password123')}
                                className="flex items-center space-x-2 p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition group"
                            >
                                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                                <div className="truncate">
                                    <p className="text-xs font-bold text-purple-900 leading-tight">Administrator</p>
                                    <p className="text-[10px] text-purple-700 truncate">System Admin</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
