import React from 'react';
import { AlertTriangle, ShieldAlert, X, AlertOctagon } from 'lucide-react';
import { SeverityBadge } from './Badge';

export default function DrugSafetyModal({ isOpen, onClose, onConfirmOverride, interactions = [], allergyAlerts = [] }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-rose-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-rose-600 text-white p-5 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Drug Safety & Interaction Alert</h3>
                            <p className="text-rose-100 text-sm">Potential clinical hazards detected in this prescription</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Allergy Conflicts Section */}
                    {allergyAlerts.length > 0 && (
                        <div>
                            <div className="flex items-center space-x-2 text-rose-700 font-semibold mb-3">
                                <AlertOctagon className="w-5 h-5 text-rose-600" />
                                <h4>Patient Allergy Collision Warnings ({allergyAlerts.length})</h4>
                            </div>
                            <div className="space-y-3">
                                {allergyAlerts.map((alert, idx) => (
                                    <div key={idx} className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-rose-900 text-sm">
                                                Allergen: {alert.allergen}
                                            </span>
                                            <SeverityBadge severity={alert.severity} />
                                        </div>
                                        <p className="text-rose-800 text-sm font-medium mb-1">
                                            Prescribed Drug: <span className="underline">{alert.medicineName}</span> ({alert.genericName})
                                        </p>
                                        <p className="text-xs text-rose-600">
                                            Patient recorded reaction: {alert.reaction || 'Severe immunological reaction'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Drug-Drug Interactions Section */}
                    {interactions.length > 0 && (
                        <div>
                            <div className="flex items-center space-x-2 text-amber-700 font-semibold mb-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <h4>Drug-Drug Adverse Interactions ({interactions.length})</h4>
                            </div>
                            <div className="space-y-3">
                                {interactions.map((inter, idx) => (
                                    <div key={idx} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-900 text-sm">
                                                {inter.medicine_1_name} + {inter.medicine_2_name}
                                            </span>
                                            <SeverityBadge severity={inter.severity} />
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed">
                                            <strong className="text-slate-900">Clinical Impact:</strong> {inter.description}
                                        </p>
                                        <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900 font-medium">
                                            <strong>Recommendation:</strong> {inter.recommendation}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600">
                        <strong>Clinical Governance Note:</strong> As the prescribing physician, you may choose to cancel and select alternative pharmacotherapy, or submit an authorized override if clinically indicated under your direct supervision.
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                        Modify Prescription
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmOverride}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
                    >
                        Acknowledge & Force Override
                    </button>
                </div>
            </div>
        </div>
    );
}
