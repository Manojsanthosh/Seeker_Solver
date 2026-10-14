import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MONTHLY_EARNINGS } from '../../mocks/seedData';
import { formatINR } from '../../lib/utils';

export const EarningsChart: React.FC = () => {
  return (
    <div className="w-full bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Earnings Performance (INR)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly payout growth across completed live problem sessions
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-indigo-600 font-heading">
            {formatINR(68000)}
          </span>
          <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            +18% this month
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MONTHLY_EARNINGS}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
                      <p className="font-bold">{payload[0].payload.month}</p>
                      <p className="text-indigo-300 font-semibold mt-0.5">
                        Earnings: {formatINR(payload[0].value as number)}
                      </p>
                      <p className="text-slate-400">
                        {payload[0].payload.jobs} sessions completed
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#4F46E5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#earningsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
