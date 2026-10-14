import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Smartphone, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4 text-left">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                Solve<span className="text-indigo-400">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier vetted problem-solving ecosystem. Connecting ambitious seekers with
              credentialed solvers to resolve complex challenges with escrow security.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                PWA & Android Ready
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Escrow Protected
              </span>
            </div>
          </div>

          {/* Column: Platform */}
          <div className="space-y-3 text-left">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#for-seekers" className="hover:text-white transition-colors">For Seekers</a></li>
              <li><a href="#for-solvers" className="hover:text-white transition-colors">For Solvers</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Solver</Link></li>
            </ul>
          </div>

          {/* Column: Technology */}
          <div className="space-y-3 text-left">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Mobile & Tech
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-white transition-colors">Capacitor Android</span></li>
              <li><span className="hover:text-white transition-colors">Progressive Web App</span></li>
              <li><span className="hover:text-white transition-colors">Offline Fallback</span></li>
              <li><span className="hover:text-white transition-colors">Safe Area Adapters</span></li>
            </ul>
          </div>

          {/* Column: Legal & Trust */}
          <div className="space-y-3 text-left">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Security & Trust
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-white transition-colors">Credential Verification</span></li>
              <li><span className="hover:text-white transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors">Dispute Resolution</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SolveBridge Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Seekers & Solvers
          </p>
        </div>
      </div>
    </footer>
  );
};
