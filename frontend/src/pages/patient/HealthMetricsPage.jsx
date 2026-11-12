import React, { useState, useEffect } from 'react';
import { metricService } from '../../services/api';
import EmergencyBanner from '../../components/common/EmergencyBanner';
import {
  Activity,
  Heart,
  Droplet,
  Moon,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  Thermometer,
  Scale,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const HealthMetricsPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emergencyNotice, setEmergencyNotice] = useState(null);
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    spO2: '',
    bloodGlucose: '',
    bloodGlucoseType: 'fasting',
    temperature: '',
    weight: '',
    sleepHours: '',
    sleepQuality: 'good',
    notes: '',
  });

  const fetchMetrics = async () => {
    try {
      const res = await metricService.getMetrics({ limit: 50 });
      setMetrics(res.data.metrics || []);
    } catch (err) {
      addToast('Failed to load metrics log.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await metricService.addMetric(form);
      addToast('Health vital entry logged successfully.', 'success');

      if (res.data.emergencyNotice) {
        setEmergencyNotice(res.data.emergencyNotice);
      } else {
        setEmergencyNotice(null);
      }

      setForm({
        systolicBP: '',
        diastolicBP: '',
        heartRate: '',
        spO2: '',
        bloodGlucose: '',
        bloodGlucoseType: 'fasting',
        temperature: '',
        weight: '',
        sleepHours: '',
        sleepQuality: 'good',
        notes: '',
      });

      fetchMetrics();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error recording vitals.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this metric log entry?')) return;
    try {
      await metricService.deleteMetric(id);
      addToast('Metric log removed.', 'info');
      setMetrics((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      addToast('Failed to delete entry.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Health Vitals Logger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Record daily physiological parameters to feed CareSync Trend Intelligence
        </p>
      </div>

      {/* Emergency banner if triggered */}
      {emergencyNotice && (
        <EmergencyBanner notice={emergencyNotice} onDismiss={() => setEmergencyNotice(null)} />
      )}

      {/* Entry Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" /> New Health Metric Log
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={form.systolicBP}
                onChange={(e) => setForm({ ...form, systolicBP: e.target.value })}
                placeholder="120"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={form.diastolicBP}
                onChange={(e) => setForm({ ...form, diastolicBP: e.target.value })}
                placeholder="80"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                value={form.heartRate}
                onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                placeholder="72"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Oxygen SpO2 (%)</label>
              <input
                type="number"
                value={form.spO2}
                onChange={(e) => setForm({ ...form, spO2: e.target.value })}
                placeholder="98"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Glucose (mg/dL)</label>
              <input
                type="number"
                value={form.bloodGlucose}
                onChange={(e) => setForm({ ...form, bloodGlucose: e.target.value })}
                placeholder="95"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Glucose Type</label>
              <select
                value={form.bloodGlucoseType}
                onChange={(e) => setForm({ ...form, bloodGlucoseType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="fasting">Fasting</option>
                <option value="post_prandial">Post-Prandial</option>
                <option value="random">Random</option>
                <option value="bedtime">Bedtime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                placeholder="36.8"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="72.5"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Duration (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={form.sleepHours}
                onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
                placeholder="7.5"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Quality</label>
              <select
                value={form.sleepQuality}
                onChange={(e) => setForm({ ...form, sleepQuality: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="excellent">Excellent (Deep & Restful)</option>
                <option value="good">Good</option>
                <option value="fair">Fair (Interrupted)</option>
                <option value="poor">Poor (Restless)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Context Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Post-exercise, morning reading"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Recording...' : 'Submit Vital Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Recorded Telemetry History ({metrics.length})
        </h3>

        {metrics.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No vitals logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="pb-3 px-2">Date & Time</th>
                  <th className="pb-3 px-2">Blood Pressure</th>
                  <th className="pb-3 px-2">Heart Rate</th>
                  <th className="pb-3 px-2">SpO2</th>
                  <th className="pb-3 px-2">Blood Glucose</th>
                  <th className="pb-3 px-2">Sleep</th>
                  <th className="pb-3 px-2">Notes</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {metrics.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 whitespace-nowrap text-slate-500">
                      {new Date(m.recordedAt).toLocaleDateString()} {new Date(m.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      {m.systolicBP && m.diastolicBP ? `${m.systolicBP}/${m.diastolicBP} mmHg` : '--'}
                    </td>
                    <td className="py-3 px-2">{m.heartRate ? `${m.heartRate} bpm` : '--'}</td>
                    <td className="py-3 px-2">{m.spO2 ? `${m.spO2}%` : '--'}</td>
                    <td className="py-3 px-2">
                      {m.bloodGlucose ? `${m.bloodGlucose} mg/dL (${m.bloodGlucoseType || 'fasting'})` : '--'}
                    </td>
                    <td className="py-3 px-2">{m.sleepHours ? `${m.sleepHours} hrs` : '--'}</td>
                    <td className="py-3 px-2 text-slate-500 max-w-xs truncate">{m.notes || '—'}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthMetricsPage;

