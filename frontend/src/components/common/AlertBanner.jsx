import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

const AlertBanner = ({ alert, onDismiss, onMarkRead }) => {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isCritical
          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
          : isWarning
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-teal-50/80 border-teal-200 text-teal-950'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl mt-0.5 ${
              isCritical
                ? 'bg-rose-100 text-rose-600'
                : isWarning
                ? 'bg-amber-100 text-amber-600'
                : 'bg-teal-100 text-teal-600'
            }`}
          >
            {isCritical ? (
              <AlertCircle className="w-5 h-5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isCritical
                    ? 'bg-rose-200 text-rose-800'
                    : isWarning
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-teal-200 text-teal-800'
                }`}
              >
                {alert.type.replace('_', ' ')}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-700 font-medium">{alert.message}</p>

            {alert.reason && (
              <div className="mt-2.5 p-3 rounded-xl bg-white/70 border border-slate-200/60 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Explainable Analysis Reason: </span>
                {alert.reason}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert._id)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all border border-transparent hover:border-slate-200"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;

