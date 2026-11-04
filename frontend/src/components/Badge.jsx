import React from 'react';

export function RoleBadge({ role }) {
    const styles = {
        admin: 'bg-purple-100 text-purple-800 border-purple-200',
        doctor: 'bg-blue-100 text-blue-800 border-blue-200',
        nurse: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        receptionist: 'bg-amber-100 text-amber-800 border-amber-200'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
            {role}
        </span>
    );
}

export function StatusBadge({ status }) {
    const styles = {
        scheduled: 'bg-sky-100 text-sky-800 border-sky-200',
        checked_in: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        in_consultation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
    };

    const labels = {
        scheduled: 'Scheduled',
        checked_in: 'Checked In',
        in_consultation: 'In Consultation',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {labels[status] || status}
        </span>
    );
}

export function SeverityBadge({ severity }) {
    const styles = {
        mild: 'bg-blue-100 text-blue-800 border-blue-200',
        moderate: 'bg-amber-100 text-amber-800 border-amber-200',
        major: 'bg-orange-100 text-orange-800 border-orange-200',
        severe: 'bg-rose-100 text-rose-800 border-rose-200',
        contraindicated: 'bg-red-200 text-red-900 border-red-300 animate-pulse'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${styles[severity] || 'bg-gray-100 text-gray-800'}`}>
            {severity}
        </span>
    );
}
