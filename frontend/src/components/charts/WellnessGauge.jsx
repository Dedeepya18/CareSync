import React from 'react';
import { Activity, Moon, Heart, Pill, AlertCircle, ShieldCheck } from 'lucide-react';

const WellnessGauge = ({ scoreData }) => {
  if (!scoreData) return null;

  const { score = 75, rating = 'Good', color = '#0d9488', breakdown, recommendations } = scoreData;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">CareSync Wellness Score</h3>
            <p className="text-xs text-slate-400">Non-diagnostic holistic wellness index</p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {rating}
          </span>
        </div>

        {/* Circular Gauge */}
        <div className="flex items-center justify-center my-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={color}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{score}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        {breakdown && (
          <div className="space-y-2.5 mt-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Score Breakdown
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep Consistency
              </span>
              <span className="font-bold text-slate-700">{breakdown.sleep?.score || 0} / 20</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${((breakdown.sleep?.score || 0) / 20) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate Stability
              </span>
              <span className="font-bold text-slate-700">{breakdown.heartRate?.score || 0} / 20</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${((breakdown.heartRate?.score || 0) / 20) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Activity className="w-3.5 h-3.5 text-teal-600" /> Blood Pressure Stability
              </span>
              <span className="font-bold text-slate-700">{breakdown.bloodPressure?.score || 0} / 20</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full"
                style={{ width: `${((breakdown.bloodPressure?.score || 0) / 20) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Pill className="w-3.5 h-3.5 text-amber-500" /> Medication Adherence
              </span>
              <span className="font-bold text-slate-700">{breakdown.medicationAdherence?.score || 0} / 20</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${((breakdown.medicationAdherence?.score || 0) / 20) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
        * Non-diagnostic indicator calculated for preventive awareness and lifestyle optimization.
      </div>
    </div>
  );
};

export default WellnessGauge;

