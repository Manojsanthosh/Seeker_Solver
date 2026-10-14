import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  HelpCircle,
  Wrench,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Smartphone,
} from 'lucide-react';

export const RoleSplitSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Tailored Experiences
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Seekers and Solvers
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Whether you need a rapid fix or want to monetize your deep technical expertise through live sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: For Seekers */}
          <div
            id="for-seekers"
            className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-soft text-left flex flex-col justify-between hover:border-indigo-200 transition-all"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <HelpCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                For Individuals & Teams
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-heading">
                I Need Problems Solved
              </h3>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Post your coding blockers, system bugs, UI tasks, or data pipeline issues. Receive
                convenient appointment slot offers from credential-verified experts in minutes.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  '100% Free to post unlimited problems with IST availability windows',
                  'Milestone escrow keeps your funds in ₹ safe until satisfied',
                  'Interactive live room with video, audio, screen share, and chat',
                  'Review solver IIT degrees, certifications, and portfolio before booking',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link to="/register?role=seeker">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started as a Seeker
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: For Solvers */}
          <div
            id="for-solvers"
            className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-xl text-left flex flex-col justify-between hover:border-indigo-500/50 transition-all text-white"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-6">
                <Wrench className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                For Verified Experts
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 font-heading">
                I Want to Solve & Earn
              </h3>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Offer flexible appointment slots that fit your schedule without proposal bidding wars.
                Solve technical tasks live and earn in Indian Rupees.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  'Showcase academic degrees, certifications & professional experience',
                  'Keep 90% of your earnings with instant withdrawals to Bank / UPI',
                  'High-value technical tasks with smart availability badges',
                  'Access via Android app with WebRTC video and notifications',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link to="/register?role=solver">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center bg-indigo-500 hover:bg-indigo-600 text-white"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Apply as a Solver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
