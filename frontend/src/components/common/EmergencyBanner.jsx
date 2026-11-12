import React from 'react';
import { PhoneCall, ShieldAlert, HeartPulse } from 'lucide-react';

const EmergencyBanner = ({ notice, onDismiss }) => {
  if (!notice || !notice.isEmergency) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-5 rounded-2xl shadow-xl mb-6 animate-pulse-subtle">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-rose-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Emergency Vital Advisory
              </span>
              <span className="text-xs text-rose-100 font-medium">Immediate Clinical Attention Advised</span>
            </div>

            <h3 className="text-base font-bold mt-1 text-white">
              Critical Physiological Reading Recorded
            </h3>

            <div className="mt-2 space-y-1.5">
              {notice.flags.map((flag, idx) => (
                <div key={idx} className="bg-black/20 p-2.5 rounded-xl text-xs text-rose-50 border border-white/10">
                  <span className="font-bold text-white">{flag.parameter} ({flag.value}):</span> {flag.warning} {flag.advisory}
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <a
                href="tel:911"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Emergency Services (911 / 112 / 108)
              </a>
              <span className="text-[11px] text-rose-200">
                Non-diagnostic emergency triage notice. If experiencing severe symptoms, do not wait.
              </span>
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white p-1 rounded-lg text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default EmergencyBanner;

