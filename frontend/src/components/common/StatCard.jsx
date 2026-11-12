import React from 'react';

const StatCard = ({ title, value, unit, icon: Icon, changeText, status = 'neutral', subtitle, onClick }) => {
  const statusColors = {
    neutral: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-rose-100 text-rose-600',
    primary: 'bg-teal-100 text-teal-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-teal-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${statusColors[status] || statusColors.neutral}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value !== null && value !== undefined ? value : '--'}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
      </div>

      {(changeText || subtitle) && (
        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          {changeText && (
            <span
              className={`font-semibold ${
                status === 'danger'
                  ? 'text-rose-600'
                  : status === 'warning'
                  ? 'text-amber-600'
                  : status === 'success'
                  ? 'text-emerald-600'
                  : 'text-slate-600'
              }`}
            >
              {changeText}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </p>
      )}
    </div>
  );
};

export default StatCard;

