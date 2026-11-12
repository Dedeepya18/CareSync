import React from 'react';
import { ShieldCheck } from 'lucide-react';

const DisclaimerNotice = ({ className = '' }) => {
  return (
    <div className={`p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2.5 ${className}`}>
      <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-semibold text-slate-700">Preventive Healthcare Disclaimer: </span>
        CareSync is designed for personal health monitoring, trend awareness, and doctor communication. It does NOT provide medical diagnosis, prescribe drugs, or substitute for licensed clinical judgment. In case of acute medical symptoms or emergencies, contact emergency services immediately.
      </div>
    </div>
  );
};

export default DisclaimerNotice;

