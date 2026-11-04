import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import MedicineCatalog from './pages/MedicineCatalog';

function RootRedirect() {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    const homeMap = {
        admin: '/admin',
        doctor: '/doctor',
        nurse: '/nurse',
        receptionist: '/reception'
    };
    return <Navigate to={homeMap[user.role] || '/login'} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            {/* Public Route */}
                            <Route path="/login" element={<Login />} />

                            {/* Root Dispatcher */}
                            <Route path="/" element={<RootRedirect />} />

                            {/* Role-Protected Dashboards */}
                            <Route
                                path="/reception/*"
                                element={
                                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                                        <ReceptionistDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/doctor/*"
                                element={
                                    <ProtectedRoute allowedRoles={['doctor']}>
                                        <DoctorDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/nurse/*"
                                element={
                                    <ProtectedRoute allowedRoles={['nurse']}>
                                        <NurseDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/*"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Shared Authenticated Clinical Routes */}
                            <Route
                                path="/patients"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
                                        <PatientList />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/patients/:id"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
                                        <PatientDetail />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/medicines"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
                                        <MedicineCatalog />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Fallback */}
                            <Route path="*" element={<RootRedirect />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
