import React from 'react';
import { ShieldCheck, Users, Clock } from 'lucide-react';

export const TrustStatsSection: React.FC = () => {
  const stats = [
    {
      value: '12,500+',
      label: 'Sessions Completed',
      sub: 'Across 6 technical domains',
      icon: ShieldCheck,
    },
    {
      value: '₹3.5 Cr+',
      label: 'Escrow Paid Out',
      sub: '100% milestone protected',
      icon: ShieldCheck,
    },
    {
      value: '4.95 / 5',
      label: 'Average Solver Rating',
      sub: 'Verified by client reviews',
      icon: Users,
    },
    {
      value: '14 Mins',
      label: 'Time to First Slot Offer',
      sub: 'Fast-track appointment matching',
      icon: Clock,
    },
  ];

  return (
    <section className="py-14 bg-slate-900 border-y border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                    {s.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-300 mt-0.5">
                    {s.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
