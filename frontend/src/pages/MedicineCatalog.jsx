import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { SeverityBadge } from '../components/Badge';
import { Pill, Search, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MedicineCatalog() {
    const [medicines, setMedicines] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    // Interactive Demo Tester State
    const [testMed1, setTestMed1] = useState('');
    const [testMed2, setTestMed2] = useState('');
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        loadCatalogData();
    }, []);

    const loadCatalogData = async () => {
        try {
            setLoading(true);
            const [medRes, intRes] = await Promise.all([
                apiRequest('/api/medicines'),
                apiRequest('/api/medicines/interactions')
            ]);

            if (medRes.success) setMedicines(medRes.medicines);
            if (intRes.success) setInteractions(intRes.interactions);
        } catch (err) {
            console.error('Error loading catalog:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRunInteractiveCheck = async (e) => {
        e.preventDefault();
        if (!testMed1 || !testMed2) {
            alert('Please select two medicines to cross-reference.');
            return;
        }

        try {
            const res = await apiRequest('/api/medicines/check-safety', {
                method: 'POST',
                body: {
                    medicineIds: [parseInt(testMed1, 10), parseInt(testMed2, 10)]
                }
            });

            if (res.success) {
                setTestResult(res);
            }
        } catch (err) {
            alert(err.message || 'Error running check');
        }
    };

    const categories = Array.from(new Set(medicines.map(m => m.category).filter(Boolean)));

    const filteredMedicines = medicines.filter(m => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = m.name.toLowerCase().includes(query) || 
                             m.generic_name.toLowerCase().includes(query) ||
                             (m.category && m.category.toLowerCase().includes(query));
        const matchesCategory = !selectedCategory || m.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Drug Safety & Pharmacological Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Relational drug inventory with pairwise adverse interaction logic
                    </p>
                </div>
            </div>

            {/* Interactive Live Pair Tester (Viva Demonstration Feature) */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center space-x-2.5 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold">Interactive Drug-Drug Interaction Simulator</h2>
                </div>
                <p className="text-xs text-blue-200 mb-5">
                    Demonstrate the database's check constraint (`medicine_id_1 &lt; medicine_id_2`) and pair-matching algorithm in real time.
                </p>

                <form onSubmit={handleRunInteractiveCheck} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5">
                        <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">Medicine A</label>
                        <select
                            value={testMed1}
                            onChange={e => setTestMed1(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="" className="text-slate-900">-- Select First Medicine --</option>
                            {medicines.map(m => (
                                <option key={m.medicine_id} value={m.medicine_id} className="text-slate-900">
                                    {m.name} ({m.generic_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-5">
                        <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">Medicine B</label>
                        <select
                            value={testMed2}
                            onChange={e => setTestMed2(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="" className="text-slate-900">-- Select Second Medicine --</option>
                            {medicines.map(m => (
                                <option key={m.medicine_id} value={m.medicine_id} className="text-slate-900">
                                    {m.name} ({m.generic_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs shadow-md transition"
                        >
                            Test Interaction
                        </button>
                    </div>
                </form>

                {/* Test Result Display */}
                {testResult && (
                    <div className="mt-5 p-4 bg-white/10 border border-white/20 rounded-xl text-xs">
                        {testResult.interactions.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-rose-300 font-bold">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    <span>Conflict Detected: {testResult.interactions[0].severity.toUpperCase()} RISK</span>
                                </div>
                                <p className="text-blue-100">{testResult.interactions[0].description}</p>
                                <div className="p-2.5 bg-black/20 rounded-lg text-amber-300 font-mono text-[11px]">
                                    Recommendation: {testResult.interactions[0].recommendation}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span>Safe Combination: No documented clinical interactions found between these two medications.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Known Interactions Knowledge Base Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        <h2 className="text-lg font-bold text-slate-900">Documented Drug-Drug Adverse Interactions</h2>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                        {interactions.length} clinical pairs registered
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Medicine Pair</th>
                                <th className="px-5 py-3">Risk Severity</th>
                                <th className="px-5 py-3">Clinical Adverse Description</th>
                                <th className="px-5 py-3">Guidance / Clinical Recommendation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {interactions.map(item => (
                                <tr key={item.interaction_id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">
                                        {item.medicine_1_name} + {item.medicine_2_name}
                                        <span className="block text-[10px] text-slate-400 font-normal">
                                            {item.medicine_1_generic} / {item.medicine_2_generic}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <SeverityBadge severity={item.severity} />
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-700 max-w-sm">
                                        {item.description}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-800 font-medium max-w-sm">
                                        {item.recommendation}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Medicine Inventory Catalog */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <Pill className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-900">Pharmaceutical Catalog ({filteredMedicines.length})</h2>
                    </div>

                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <div className="relative w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Search by name, generic..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Brand Name</th>
                                <th className="px-5 py-3">Generic (Active Ingredient)</th>
                                <th className="px-5 py-3">Therapeutic Class</th>
                                <th className="px-5 py-3">Dosage Form</th>
                                <th className="px-5 py-3">Strength</th>
                                <th className="px-5 py-3">Clinical Indication</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMedicines.map(med => (
                                <tr key={med.medicine_id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 font-bold text-slate-900">{med.name}</td>
                                    <td className="px-5 py-3 font-mono text-slate-700">{med.generic_name}</td>
                                    <td className="px-5 py-3">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                                            {med.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">{med.dosage_form}</td>
                                    <td className="px-5 py-3 font-bold text-indigo-700">{med.strength}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{med.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
