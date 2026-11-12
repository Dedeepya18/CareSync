import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/api';
import AlertBanner from '../../components/common/AlertBanner';
import { AlertTriangle, Sparkles, RefreshCw, CheckCircle, ShieldAlert, Filter } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const { addToast } = useNotification();

  const fetchAlerts = async () => {
    try {
      const res = await alertService.getAlerts({ includeDismissed: showDismissed });
      setAlerts(res.data.alerts || []);
    } catch (err) {
      addToast('Failed to load alerts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [showDismissed]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await alertService.runAnalysis();
      addToast(
        `Trend analysis finished: ${res.data.result.trendsDetected} pattern(s) identified.`,
        'success'
      );
      fetchAlerts();
    } catch (err) {
      addToast('Error running trend analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await alertService.dismissAlert(id);
      addToast('Alert dismissed.', 'info');
      fetchAlerts();
    } catch (err) {
      addToast('Failed to dismiss alert.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Retrieving Preventive Alerts...</p>
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
              Explainable AI Alerts
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Preventive Health Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            CareSync analyzes longitudinal vital patterns and explains transparently why each alert was generated.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              showDismissed
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showDismissed ? 'Hide Dismissed' : 'Show All'}
          </button>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Scanning...' : 'Scan Health Trajectory'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No Active Health Alerts</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your physiological readings show stable trajectories without anomalous fluctuations over the evaluated window.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertBanner
              key={alert._id}
              alert={alert}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;

