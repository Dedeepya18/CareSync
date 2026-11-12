import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/api';
import WellnessGauge from '../../components/charts/WellnessGauge';
import {
  Award,
  ShieldCheck,
  Moon,
  Heart,
  Activity,
  Pill,
  BookOpen,
  Sparkles,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const WellnessScorePage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await patientService.getDashboard();
        setDashboardData(res.data.dashboard);
      } catch (err) {
        addToast('Failed to load wellness score data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Calculating Holistic Wellness Index...</p>
      </div>
    );
  }

  const scoreData = dashboardData?.wellnessScore;
  const breakdown = scoreData?.breakdown;
  const recommendations = scoreData?.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
            Holistic Health Indicator
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
          CareSync Wellness Score & Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          An explainable, multi-factor scoring mechanism assessing restorative sleep, physiological stability, prescription compliance, and reported symptoms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: The Interactive Visual Gauge */}
        <div>
          <WellnessGauge scoreData={scoreData} />
        </div>

        {/* Right Column: Detailed Factor Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Scoring Components Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Moon className="w-4 h-4 text-indigo-500" /> Sleep Consistency
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600">
                    {breakdown?.sleep?.score || 0} / 20 pts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Optimal score achieved with 7.0–9.0 hours of regular nocturnal rest.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Heart className="w-4 h-4 text-rose-500" /> Resting Heart Rate
                  </span>
                  <span className="text-xs font-extrabold text-rose-600">
                    {breakdown?.heartRate?.score || 0} / 20 pts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Optimal resting range (60–78 bpm) indicates efficient cardiovascular reserve.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Activity className="w-4 h-4 text-teal-600" /> Blood Pressure
                  </span>
                  <span className="text-xs font-extrabold text-teal-700">
                    {breakdown?.bloodPressure?.score || 0} / 20 pts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Systolic &lt; 120 and diastolic &lt; 80 mmHg represent optimal arterial compliance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Pill className="w-4 h-4 text-amber-500" /> Medication Adherence
                  </span>
                  <span className="text-xs font-extrabold text-amber-600">
                    {breakdown?.medicationAdherence?.score || 0} / 20 pts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Compliance rate: {breakdown?.medicationAdherence?.rate || 100}%. Adherence above 90% protects stability.
                </p>
              </div>
            </div>
          </div>

          {/* Personalized Lifestyle Recommendations */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-teal-900">
              <Lightbulb className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Tailored Lifestyle & Preventive Recommendations
              </h3>
            </div>

            <div className="space-y-2.5">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-teal-950 font-medium flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessScorePage;

