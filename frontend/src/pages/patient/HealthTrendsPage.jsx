import React, { useState, useEffect } from 'react';
import { metricService, alertService } from '../../services/api';
import MetricLineChart from '../../components/charts/MetricLineChart';
import AlertBanner from '../../components/common/AlertBanner';
import {
  TrendingUp,
  Activity,
  Heart,
  Droplet,
  Moon,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const HealthTrendsPage = () => {
  const [range, setRange] = useState('30');
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { addToast } = useNotification();

  const fetchData = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        metricService.getMetrics({ range }),
        alertService.getAlerts({ includeDismissed: false }),
      ]);
      setMetrics(mRes.data.metrics || []);
      setAlerts(aRes.data.alerts || []);
    } catch (err) {
      addToast('Failed to load health trends data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await alertService.runAnalysis();
      addToast(
        `Analysis complete: ${res.data.result.trendsDetected} pattern(s) identified.`,
        'success'
      );
      fetchData();
    } catch (err) {
      addToast('Failed to execute trend analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Analyzing Longitudinal Vitals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
              Trend Intelligence Module
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Longitudinal Health Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Detecting gradual multi-day trajectories and subtle shifts before they cross dangerous threshold boundaries.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {analyzing ? 'Scanning Patterns...' : 'Run Trend Intelligence'}
        </button>
      </div>

      {/* Identified Pattern Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Algorithmically Detected Patterns ({alerts.length})</span>
          </h3>
          {alerts.map((alert) => (
            <AlertBanner key={alert._id} alert={alert} />
          ))}
        </div>
      )}

      {/* Trend Charts Grid */}
      <div className="space-y-6">
        {/* 1. Blood Pressure Trajectory */}
        <MetricLineChart
          data={metrics}
          title="Blood Pressure Trend (Systolic vs Diastolic)"
          metricKey="systolicBP"
          metricKey2="diastolicBP"
          showDual={true}
          label1="Systolic (mmHg)"
          label2="Diastolic (mmHg)"
          color1="#0d9488"
          color2="#f43f5e"
          unit="mmHg"
          range={range}
          onRangeChange={setRange}
        />

        {/* 2. Heart Rate and SpO2 in 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricLineChart
            data={metrics}
            title="Resting Heart Rate Trajectory"
            metricKey="heartRate"
            label1="Heart Rate (bpm)"
            color1="#e11d48"
            unit="bpm"
          />

          <MetricLineChart
            data={metrics}
            title="Blood Oxygen Saturation (SpO2)"
            metricKey="spO2"
            label1="SpO2 (%)"
            color1="#0284c7"
            unit="%"
          />
        </div>

        {/* 3. Blood Glucose and Sleep Duration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricLineChart
            data={metrics}
            title="Blood Glucose Trajectory"
            metricKey="bloodGlucose"
            label1="Glucose (mg/dL)"
            color1="#d97706"
            unit="mg/dL"
          />

          <MetricLineChart
            data={metrics}
            title="Sleep Duration Trajectory"
            metricKey="sleepHours"
            label1="Sleep (hrs)"
            color1="#6366f1"
            unit="hrs"
          />
        </div>
      </div>
    </div>
  );
};

export default HealthTrendsPage;

