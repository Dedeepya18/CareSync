import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import AlertBanner from '../../components/common/AlertBanner';
import {
  Users,
  AlertTriangle,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchDoctorData = async () => {
    try {
      const [dashRes, patRes] = await Promise.all([
        doctorService.getDashboard(),
        doctorService.getConsentedPatients(),
      ]);
      setDashboard(dashRes.data);
      setPatients(patRes.data.patients || []);
    } catch (err) {
      addToast('Failed to load doctor dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Loading Doctor Telehealth Hub...</p>
      </div>
    );
  }

  const stats = dashboard?.stats;
  const abnormalAlerts = dashboard?.abnormalAlerts || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-indigo-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
            Clinical Tele-Monitoring Portal
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 text-white">
          Doctor Clinical Oversight Dashboard
        </h1>
        <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
          Review consented patient longitudinal trends, investigate anomalous physiological signals, and provide preventive clinical guidance.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Consented Patients"
          value={stats?.activePatientCount || 0}
          icon={Users}
          status="primary"
          subtitle="Authorized for remote monitoring"
        />

        <StatCard
          title="Abnormal Health Trends"
          value={stats?.abnormalTrendsCount || 0}
          icon={AlertTriangle}
          status={stats?.abnormalTrendsCount > 0 ? 'warning' : 'success'}
          subtitle="Requiring clinical observation"
        />

        <StatCard
          title="Observations Provided"
          value={stats?.totalNotesGiven || 0}
          icon={FileText}
          status="neutral"
          subtitle="Documented guidance entries"
        />
      </div>

      {/* Abnormal Trend Signals from Consented Patients */}
      {abnormalAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Anomalous Physiological Signals in Consented Patients ({abnormalAlerts.length})</span>
          </h3>
          <div className="space-y-2.5">
            {abnormalAlerts.map((alert) => (
              <div
                key={alert._id}
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">Patient: {alert.patient?.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      {alert.title}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700 font-medium">{alert.reason}</p>
                </div>
                <Link
                  to={`/doctor/patients/${alert.patient?._id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-center whitespace-nowrap"
                >
                  Inspect Patient <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consented Patients Directory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          Consented Patient Roster ({patients.length})
        </h3>

        {patients.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No Patient Consents Currently Active</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When patients authorize you via their CareSync Doctor Sharing ledger, their profiles and longitudinal vitals will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((item) => {
              const p = item.patient;
              const metric = item.latestMetric;

              return (
                <div
                  key={item.consentId}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {p?.name ? p.name.charAt(0) : 'P'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{p?.name}</h4>
                          <p className="text-xs text-slate-500">{p?.email}</p>
                        </div>
                      </div>

                      {item.activeAlertsCount > 0 && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {item.activeAlertsCount} Alert{item.activeAlertsCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Latest BP</span>
                        <span className="text-xs font-bold text-slate-800">
                          {metric?.systolicBP ? `${metric.systolicBP}/${metric.diastolicBP}` : '--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Heart Rate</span>
                        <span className="text-xs font-bold text-slate-800">
                          {metric?.heartRate ? `${metric.heartRate} bpm` : '--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">SpO2</span>
                        <span className="text-xs font-bold text-slate-800">
                          {metric?.spO2 ? `${metric.spO2}%` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Authorized: {new Date(item.grantedAt).toLocaleDateString()}
                    </span>

                    <Link
                      to={`/doctor/patients/${p?._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                    >
                      View Patient Trends <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

