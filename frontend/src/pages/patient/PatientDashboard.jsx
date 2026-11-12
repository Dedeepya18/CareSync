import React, { useState, useEffect } from 'react';
import { patientService, metricService, medicationService, alertService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import MetricLineChart from '../../components/charts/MetricLineChart';
import WellnessGauge from '../../components/charts/WellnessGauge';
import AlertBanner from '../../components/common/AlertBanner';
import EmergencyBanner from '../../components/common/EmergencyBanner';
import Modal from '../../components/common/Modal';
import {
  Activity,
  Heart,
  Droplet,
  Moon,
  Pill,
  Sparkles,
  Plus,
  ArrowUpRight,
  Check,
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import AISummaryModal from '../../components/ai/AISummaryModal';

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [chartRange, setChartRange] = useState('14');
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [emergencyNotice, setEmergencyNotice] = useState(null);
  const { addToast } = useNotification();

  // Quick vital log form state
  const [vitalForm, setVitalForm] = useState({
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    spO2: '',
    bloodGlucose: '',
    sleepHours: '',
    notes: '',
  });

  const fetchDashboard = async () => {
    try {
      const [dashRes, metricsRes] = await Promise.all([
        patientService.getDashboard(),
        metricService.getMetrics({ range: chartRange }),
      ]);
      setDashboardData(dashRes.data.dashboard);
      setMetrics(metricsRes.data.metrics || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast('Error loading dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [chartRange]);

  const handleMarkDose = async (medicationId, status) => {
    try {
      await medicationService.logAction(medicationId, { status });
      addToast(`Medication marked as ${status}!`, 'success');
      fetchDashboard();
    } catch (err) {
      addToast('Failed to update medication status.', 'error');
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await alertService.dismissAlert(alertId);
      addToast('Alert dismissed.', 'info');
      setDashboardData((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts.filter((a) => a._id !== alertId),
      }));
    } catch (err) {
      addToast('Failed to dismiss alert.', 'error');
    }
  };

  const handleLogVitalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await metricService.addMetric(vitalForm);
      addToast('Health metric recorded successfully.', 'success');
      if (res.data.emergencyNotice) {
        setEmergencyNotice(res.data.emergencyNotice);
      }
      setShowLogModal(false);
      setVitalForm({
        systolicBP: '',
        diastolicBP: '',
        heartRate: '',
        spO2: '',
        bloodGlucose: '',
        sleepHours: '',
        notes: '',
      });
      fetchDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record vitals.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Loading Health Dashboard...</p>
      </div>
    );
  }

  const latest = dashboardData?.latestVitals;
  const activeAlerts = dashboardData?.activeAlerts || [];
  const schedule = dashboardData?.medicationSchedule || [];

  return (
    <div className="space-y-6">
      {/* Emergency alert banner if triggered */}
      {emergencyNotice && (
        <EmergencyBanner
          notice={emergencyNotice}
          onDismiss={() => setEmergencyNotice(null)}
        />
      )}

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-teal-700/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              CareSync Preventive Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 text-white">
            Personal Health Dashboard
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
            Continuous health telemetry, explainable pattern intelligence, and collaborative clinical oversight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-teal-50 text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Today's Vitals
          </button>
          <button
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold border border-teal-500/40 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-teal-200" /> AI Doctor Briefing
          </button>
        </div>
      </div>

      {/* Active Explainable Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Active Preventive Health Alerts ({activeAlerts.length})</span>
            </h3>
          </div>
          {activeAlerts.map((alert) => (
            <AlertBanner
              key={alert._id}
              alert={alert}
              onDismiss={handleDismissAlert}
            />
          ))}
        </div>
      )}

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Blood Pressure"
          value={latest?.systolicBP ? `${latest.systolicBP}/${latest.diastolicBP}` : '--'}
          unit="mmHg"
          icon={Activity}
          status={latest?.systolicBP > 135 ? 'warning' : 'success'}
          changeText={latest?.systolicBP > 135 ? 'Elevated' : 'Desirable'}
          subtitle="Latest reading"
        />

        <StatCard
          title="Resting Heart Rate"
          value={latest?.heartRate || '--'}
          unit="bpm"
          icon={Heart}
          status={latest?.heartRate > 90 ? 'warning' : 'primary'}
          changeText={latest?.heartRate > 80 ? 'Elevated' : 'Optimal'}
          subtitle="Resting pulse"
        />

        <StatCard
          title="Oxygen Saturation"
          value={latest?.spO2 ? `${latest.spO2}%` : '--'}
          unit="SpO2"
          icon={Droplet}
          status={latest?.spO2 < 95 ? 'warning' : 'success'}
          changeText={latest?.spO2 < 95 ? 'Low' : 'Normal'}
          subtitle="Healthy >= 95%"
        />

        <StatCard
          title="Sleep Duration"
          value={latest?.sleepHours || '--'}
          unit="hours"
          icon={Moon}
          status={latest?.sleepHours < 6 ? 'warning' : 'neutral'}
          changeText={latest?.sleepHours >= 7 ? 'Restorative' : 'Deficit'}
          subtitle="Nightly log"
        />
      </div>

      {/* Central Row: Charts & Wellness Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MetricLineChart
            data={metrics}
            title="Blood Pressure Trajectory (Systolic & Diastolic)"
            metricKey="systolicBP"
            metricKey2="diastolicBP"
            showDual={true}
            label1="Systolic (mmHg)"
            label2="Diastolic (mmHg)"
            color1="#0d9488"
            color2="#f43f5e"
            unit="mmHg"
            range={chartRange}
            onRangeChange={setChartRange}
          />
        </div>

        <div>
          <WellnessGauge scoreData={dashboardData?.wellnessScore} />
        </div>
      </div>

      {/* Bottom Row: Today's Medication Schedule & Recent Symptoms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication Schedule Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Today's Medication Schedule</h3>
              <p className="text-xs text-slate-400">Adherence verification for prescribed regimens</p>
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
              {schedule.filter((s) => s.statusToday === 'taken').length} / {schedule.length} Taken
            </span>
          </div>

          <div className="space-y-3">
            {schedule.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No active medications registered. Add your prescriptions in the Medication module.
              </p>
            ) : (
              schedule.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        med.statusToday === 'taken'
                          ? 'bg-emerald-100 text-emerald-700'
                          : med.statusToday === 'missed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{med.name} ({med.dosage})</h4>
                      <p className="text-[11px] text-slate-500">
                        {med.frequency} • Scheduled at {med.reminderTimes?.join(', ') || '08:00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {med.statusToday === 'taken' ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Taken
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleMarkDose(med.id, 'taken')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition-all"
                        >
                          Take
                        </button>
                        <button
                          onClick={() => handleMarkDose(med.id, 'missed')}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-rose-100 hover:text-rose-700 transition-all"
                        >
                          Miss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Symptoms & Clinical Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Symptom Journal</h3>
              <p className="text-xs text-slate-400">Chronological symptom occurrences</p>
            </div>
            <a
              href="/symptoms"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Full Journal <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {(dashboardData?.recentSymptoms || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No recent symptoms logged. Great news!
              </p>
            ) : (
              (dashboardData?.recentSymptoms || []).map((sym) => (
                <div
                  key={sym._id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{sym.symptomName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sym.severity >= 7
                            ? 'bg-rose-100 text-rose-700'
                            : sym.severity >= 4
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        Severity: {sym.severity}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {sym.bodyLocation} • Duration: {sym.duration} • Status: {sym.status}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(sym.onsetDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Vitals Modal */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Record Health Vitals">
        <form onSubmit={handleLogVitalSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={vitalForm.systolicBP}
                onChange={(e) => setVitalForm({ ...vitalForm, systolicBP: e.target.value })}
                placeholder="e.g. 120"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={vitalForm.diastolicBP}
                onChange={(e) => setVitalForm({ ...vitalForm, diastolicBP: e.target.value })}
                placeholder="e.g. 80"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resting Heart Rate (bpm)</label>
              <input
                type="number"
                value={vitalForm.heartRate}
                onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })}
                placeholder="e.g. 72"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Oxygen Saturation (%)</label>
              <input
                type="number"
                value={vitalForm.spO2}
                onChange={(e) => setVitalForm({ ...vitalForm, spO2: e.target.value })}
                placeholder="e.g. 98"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Glucose (mg/dL)</label>
              <input
                type="number"
                value={vitalForm.bloodGlucose}
                onChange={(e) => setVitalForm({ ...vitalForm, bloodGlucose: e.target.value })}
                placeholder="e.g. 95"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Duration (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={vitalForm.sleepHours}
                onChange={(e) => setVitalForm({ ...vitalForm, sleepHours: e.target.value })}
                placeholder="e.g. 7.5"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Context / Notes</label>
            <input
              type="text"
              value={vitalForm.notes}
              onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
              placeholder="e.g. Recorded after 15 min rest, took morning medication"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
            >
              Save Vitals Log
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Doctor Briefing Modal */}
      {showAIModal && (
        <AISummaryModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;

