import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const MetricLineChart = ({
  data = [],
  metricKey = 'systolicBP',
  metricKey2 = 'diastolicBP',
  title = 'Health Metric Trend',
  color1 = '#0d9488',
  color2 = '#f43f5e',
  unit = 'mmHg',
  range,
  onRangeChange,
  showDual = false,
  label1 = 'Systolic',
  label2 = 'Diastolic',
}) => {
  const formattedData = data.map((item) => {
    const d = new Date(item.recordedAt);
    return {
      ...item,
      dateFormatted: `${d.getMonth() + 1}/${d.getDate()}`,
      fullDate: d.toLocaleDateString(),
    };
  });

  const ranges = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '3 Months', value: '90' },
    { label: 'All', value: 'all' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Chronological readings & trend trajectory</p>
        </div>

        {onRangeChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeChange(r.value)}
                className={`text-xs px-3 py-1 font-semibold rounded-lg transition-all ${
                  range === r.value
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {formattedData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
          <p>No historical data recorded for this time range.</p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dateFormatted"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                unit={` ${unit}`}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
                labelFormatter={(val, items) => {
                  if (items && items[0]) {
                    return `Date: ${items[0].payload.fullDate}`;
                  }
                  return val;
                }}
              />
              {showDual && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
              <Line
                type="monotone"
                dataKey={metricKey}
                name={label1}
                stroke={color1}
                strokeWidth={2.5}
                dot={{ r: 3, fill: color1 }}
                activeDot={{ r: 6 }}
              />
              {showDual && (
                <Line
                  type="monotone"
                  dataKey={metricKey2}
                  name={label2}
                  stroke={color2}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: color2 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MetricLineChart;

