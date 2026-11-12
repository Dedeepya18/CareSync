import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const AdherenceBarChart = ({ data = [], adherenceRate = 100 }) => {
  const formatted = data.map((d) => ({
    ...d,
    dateShort: d.date ? d.date.slice(5) : '',
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Medication Adherence History</h3>
          <p className="text-xs text-slate-400">Daily dose compliance tracking</p>
        </div>
        <div className="flex items-baseline gap-1.5 bg-teal-50 px-3 py-1 rounded-xl border border-teal-100">
          <span className="text-xs text-teal-700 font-medium">Compliance:</span>
          <span className="text-sm font-extrabold text-teal-800">{adherenceRate}%</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="dateShort" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Bar dataKey="taken" name="Taken" fill="#0d9488" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missed" name="Missed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="skipped" name="Skipped" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdherenceBarChart;

