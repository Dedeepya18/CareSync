import React, { useState, useEffect } from 'react';
import { symptomService } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  BookOpen,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const SymptomJournalPage = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [recurringPatterns, setRecurringPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    symptomName: '',
    severity: 5,
    duration: '2 hours',
    bodyLocation: 'General',
    notes: '',
    triggers: '',
  });

  const fetchSymptoms = async () => {
    try {
      const res = await symptomService.getSymptoms();
      setSymptoms(res.data.symptoms || []);
      setRecurringPatterns(res.data.recurringPatterns || []);
    } catch (err) {
      addToast('Failed to load symptom records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        triggers: form.triggers ? form.triggers.split(',').map((t) => t.trim()) : [],
      };
      await symptomService.addSymptom(payload);
      addToast('Symptom entry added to journal.', 'success');
      setShowModal(false);
      setForm({
        symptomName: '',
        severity: 5,
        duration: '2 hours',
        bodyLocation: 'General',
        notes: '',
        triggers: '',
      });
      fetchSymptoms();
    } catch (err) {
      addToast('Error saving symptom.', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await symptomService.updateSymptom(id, { status });
      addToast(`Status updated to ${status}.`, 'success');
      fetchSymptoms();
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this symptom record?')) return;
    try {
      await symptomService.deleteSymptom(id);
      addToast('Symptom record removed.', 'info');
      setSymptoms((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      addToast('Failed to delete symptom.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Loading Symptom Journal...</p>
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
              Symptom Journal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Symptom Diary & Pattern Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log subjective symptoms with severity ratings to uncover recurring patterns for doctor review.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Record New Symptom
        </button>
      </div>

      {/* Recurring Patterns Insight Box */}
      {recurringPatterns.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Pattern Recognition Observation
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                CareSync detected recurring episodes in your logs. (Non-diagnostic pattern observation for clinical consultation).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recurringPatterns.map((pat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/90 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 shadow-sm"
                  >
                    {pat.symptomName}: {pat.occurrences} logs recently
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms Timeline List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          Symptom Timeline ({symptoms.length})
        </h3>

        {symptoms.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            No symptoms logged yet. Click "Record New Symptom" above to start your journal.
          </p>
        ) : (
          <div className="space-y-4">
            {symptoms.map((s) => (
              <div
                key={s._id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{s.symptomName}</h4>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        s.severity >= 8
                          ? 'bg-rose-100 text-rose-700'
                          : s.severity >= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      Severity: {s.severity} / 10
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
                      {s.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Body Location: <span className="font-semibold text-slate-800">{s.bodyLocation}</span> • Duration: <span className="font-semibold text-slate-800">{s.duration}</span>
                  </p>

                  {s.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{s.notes}"
                    </p>
                  )}

                  {s.triggers && s.triggers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Triggers:</span>
                      {s.triggers.map((trig, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {trig}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {new Date(s.onsetDate).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {s.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(s._id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-semibold"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Symptom Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Symptom Episode">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Symptom Name *</label>
            <input
              type="text"
              value={form.symptomName}
              onChange={(e) => setForm({ ...form, symptomName: e.target.value })}
              placeholder="e.g. Throbbing Headache, Shortness of Breath"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Severity Rating (1 to 10)</label>
              <span className="text-xs font-extrabold text-teal-600">{form.severity} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 (Very Mild)</span>
              <span>5 (Moderate)</span>
              <span>10 (Severe / Disabling)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration *</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 45 minutes, 2 days"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Body Location</label>
              <input
                type="text"
                value={form.bodyLocation}
                onChange={(e) => setForm({ ...form, bodyLocation: e.target.value })}
                placeholder="e.g. Forehead, Chest, Lower Back"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Triggers (comma separated)</label>
            <input
              type="text"
              value={form.triggers}
              onChange={(e) => setForm({ ...form, triggers: e.target.value })}
              placeholder="e.g. Screen time, Dehydration, Stress"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Observations / Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="How did it start? What provided relief?"
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
              Save Symptom
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SymptomJournalPage;

