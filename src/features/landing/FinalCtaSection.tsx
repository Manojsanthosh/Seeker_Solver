import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowRight, HelpCircle, Wrench, ShieldCheck } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-6 border border-white/20">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>No Credit Card Required to Post</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Ready to Solve or Be Solved?
        </h2>
        <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
          Join thousands of creators, engineers, and companies who rely on SolveBridge every day.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link to="/register?role=seeker" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-slate-100 shadow-xl"
              leftIcon={<HelpCircle className="w-5 h-5 text-indigo-600" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Post a Problem
            </Button>
          </Link>
          <Link to="/register?role=solver" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10"
              leftIcon={<Wrench className="w-5 h-5 text-indigo-200" />}
            >
              Join as Solver
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
