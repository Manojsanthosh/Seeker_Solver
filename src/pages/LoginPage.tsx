import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../features/auth/LoginForm';
import { Zap, ShieldCheck, CheckCircle2, Star, Smartphone } from 'lucide-react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-white">
      {/* Left Column: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
              Solve<span className="text-indigo-600">Bridge</span>
            </span>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="py-8 my-auto w-full">
          <LoginForm />
        </div>

        <div className="pt-4 text-xs text-slate-400 text-center sm:text-left flex items-center justify-between">
          <span>© {new Date().getFullYear()} SolveBridge</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Smartphone className="w-3.5 h-3.5" /> PWA & Android Ready
          </span>
        </div>
      </div>

      {/* Right Column: Premium Brand Panel (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0F172A] via-slate-900 to-indigo-950 p-16 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex justify-end">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-900/40 px-3 py-1.5 rounded-full border border-indigo-700/50">
            Enterprise Grade Security
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6 text-left">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight font-heading leading-tight">
            The trusted bridge between problems & solutions.
          </h2>

          <p className="text-slate-300 text-base leading-relaxed">
            Over 12,500 tasks resolved with 100% milestone escrow guarantee. Verified credentials,
            real-time workspace collaboration, and lightning fast payouts.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Vetted academic degrees and verified technical certifications',
              'Direct chat and milestone-based code deliveries',
              'Native Android APK and responsive web experience',
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solver quote card */}
        <div className="relative z-10 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-md text-left">
          <div className="flex items-center space-x-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <p className="text-xs text-slate-300 italic">
            "SolveBridge gives verified engineers respect, serious seekers, and zero bidding wars."
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">
              AR
            </div>
            <span className="text-xs font-semibold text-white">Dr. Alex Rivera</span>
            <span className="text-[11px] text-slate-400">• Stanford MSc</span>
          </div>
        </div>
      </div>
    </div>
  );
};
