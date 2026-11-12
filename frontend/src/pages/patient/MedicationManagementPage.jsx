import React, { useState, useEffect } from 'react';
import { medicationService } from '../../services/api';
import AdherenceBarChart from '../../components/charts/AdherenceBarChart';
import Modal from '../../components/common/Modal';
import {
  Pill,
  Plus,
  Check,
  X,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const MedicationManagementPage = () => {
  const [medications, setMedications] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    route: 'Oral',
    purpose: '',
    instructions: 'Take after breakfast with water',
    reminderTimes: '08:00',
    prescriberName: '',
  });

  const fetchData = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        medicationService.getMedications(),
        medicationService.getAdherence({ days: 14 }),
      ]);
      setMedications(mRes.data.medications || []);
      setAdherenceStats(aRes.data.stats || null);
    } catch (err) {
      addToast('Failed to load medication management data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        reminderTimes: form.reminderTimes.split(',').map((t) => t.trim()),
      };
      await medicationService.addMedication(payload);
      addToast('Medication regimen registered.', 'success');
      setShowModal(false);
      setForm({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        route: 'Oral',
        purpose: '',
        instructions: 'Take after breakfast with water',
        reminderTimes: '08:00',
        prescriberName: '',
      });
      fetchData();
    } catch (err) {
      addToast('Failed to save medication.', 'error');
    }
  };

  const handleLogAction = async (medId, status) => {
    try {
      await medicationService.logAction(medId, { status });
      addToast(`Dose marked as ${status}.`, 'success');
      fetchData();
    } catch (err) {
      addToast('Error logging dose.', 'error');
    }
  };

  const handleDeleteMedication = async (id) => {
    if (!window.confirm('Delete this medication from schedule?')) return;
    try {
      await medicationService.deleteMedication(id);
      addToast('Medication deleted.', 'info');
      setMedications((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      addToast('Failed to delete medication.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Loading Prescriptions & Adherence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
              Medication Management
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Prescription Regimen & Adherence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track doses, schedule reminders, and visualize 14-day medication compliance statistics.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* Adherence Chart & Stat Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdherenceBarChart
            data={adherenceStats?.dailyChartData || []}
            adherenceRate={adherenceStats?.adherencePercentage || 100}
          />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Compliance Analytics</h3>
            <p className="text-xs text-slate-400 mt-0.5">14-Day compliance telemetry</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <Check className="w-4 h-4" /> Doses Taken
                </div>
                <span className="text-base font-extrabold text-emerald-900">
                  {adherenceStats?.takenCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                  <X className="w-4 h-4" /> Doses Missed
                </div>
                <span className="text-base font-extrabold text-rose-900">
                  {adherenceStats?.missedCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <Clock className="w-4 h-4" /> Skipped / Postponed
                </div>
                <span className="text-base font-extrabold text-amber-900">
                  {adherenceStats?.skippedCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
            * Consistent adherence maintains therapeutic drug blood levels, avoiding rebound hypertension or glycemic volatility.
          </div>
        </div>
      </div>

      {/* Active Medications List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          Registered Prescriptions ({medications.length})
        </h3>

        {medications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            No medications currently on file. Click "Add Medication" above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((m) => (
              <div
                key={m._id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                        <span className="text-xs font-semibold text-teal-700">{m.dosage} • {m.route}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMedication(m._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p><span className="font-semibold text-slate-700">Frequency:</span> {m.frequency}</p>
                    <p><span className="font-semibold text-slate-700">Schedule Time(s):</span> {m.reminderTimes?.join(', ')}</p>
                    {m.purpose && <p><span className="font-semibold text-slate-700">Purpose:</span> {m.purpose}</p>}
                    {m.instructions && <p className="italic text-slate-500">"{m.instructions}"</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Prescriber: {m.prescriberName || 'Attending Physician'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleLogAction(m._id, 'taken')}
                      className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Log Taken
                    </button>
                    <button
                      onClick={() => handleLogAction(m._id, 'missed')}
                      className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-bold transition-all"
                    >
                      Log Missed
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Medication Prescription">
        <form onSubmit={handleAddMedication} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Lisinopril, Metformin"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dosage *</label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 10mg, 500mg, 1 tablet"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="As needed">As needed</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Route</label>
              <select
                value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Oral">Oral (Tablet/Capsule)</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Injection">Injection</option>
                <option value="Topical">Topical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reminder Time(s)</label>
              <input
                type="text"
                value={form.reminderTimes}
                onChange={(e) => setForm({ ...form, reminderTimes: e.target.value })}
                placeholder="08:00, 20:00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prescribing Doctor</label>
              <input
                type="text"
                value={form.prescriberName}
                onChange={(e) => setForm({ ...form, prescriberName: e.target.value })}
                placeholder="Dr. Emily Chen"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Purpose</label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="e.g. Hypertension management"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
            <textarea
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
            >
              Save Medication
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicationManagementPage;

