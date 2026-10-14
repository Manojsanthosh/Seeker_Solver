import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  HelpCircle,
  Wrench,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
      {/* Background soft glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-200/30 via-violet-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-in fade-in duration-300">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Vetted Expert Network • Guaranteed Milestone Escrow in ₹</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Connect with Verified{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
            Problem Solvers
          </span>
          , Or Solve & Earn.
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The appointment-driven platform bridging ambitious Seekers with credentialed, vetted Solvers.
          Pick flexible session slots and solve live via audio, video, and screen share.
        </p>

        {/* Dual CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link to="/register?role=seeker" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-elevated"
              leftIcon={<HelpCircle className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              I Need Help (Seeker)
            </Button>
          </Link>
          <Link to="/register?role=solver" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto border border-slate-700"
              leftIcon={<Wrench className="w-5 h-5 text-indigo-400" />}
            >
              I Want to Solve
            </Button>
          </Link>
        </div>

        {/* Mini stats badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>100% Vetted Solvers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Milestone Escrow in ₹</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>Android WebRTC Ready</span>
          </div>
        </div>

        {/* Mock Dashboard Preview Graphic */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-3xl p-2 sm:p-4 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl backdrop-blur-xs">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl text-left">
            {/* Window control dots */}
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">solvebridge.app/dashboard</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                Live Preview
              </span>
            </div>

            {/* Dashboard Mock UI */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0F172A] text-slate-100">
              {/* Stat card 1 */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Resolution Rate</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> 98.4%
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2 font-heading">₹1,84,500</div>
                <div className="text-[11px] text-slate-400 mt-1">Total escrow distributed</div>
              </div>

              {/* Stat card 2 */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Top Solver Credential</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-base font-bold mt-2 text-white">IIT Madras M.Tech • 8 yrs exp</div>
                <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>4.98 Rating (42 sessions solved)</span>
                </div>
              </div>

              {/* Stat card 3 */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Average Time to Slot Offer</span>
                  <span className="text-indigo-400 font-semibold">14 mins</span>
                </div>
                <div className="text-base font-bold mt-2 text-white">Live Session Matching</div>
                <div className="text-[11px] text-slate-400 mt-1">Appointment slots & escrow lock</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
