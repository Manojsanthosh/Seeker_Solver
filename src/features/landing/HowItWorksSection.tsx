import React from 'react';
import { Calendar, ShieldAlert, Award } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Post Problem with Preferred Windows',
      description:
        'Seekers submit specific tasks with budget in ₹ and preferred IST time windows. Solvers offer up to 5 appointment slots.',
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      step: '02',
      title: 'Pick a Slot & Escrow Deposit',
      description:
        'The seeker picks a slot that suits them. Payment is held in secure milestone escrow and is only released after session completion.',
      icon: ShieldAlert,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      step: '03',
      title: 'Meet in Live Session Room',
      description:
        'Both meet in a real-time session room featuring video, audio, screen share, and synchronized chat to solve the problem together.',
      icon: Award,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Simple & Transparent
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How SolveBridge Works
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Three simple steps replacing proposals with flexible appointment slots and live interactive sessions.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-soft transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform ${item.color}`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-black text-slate-300 font-heading">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-slate-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
