import React from 'react';
import { PostProblemForm } from '../features/seeker/PostProblemForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const PostProblemPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-in fade-in">
      {/* Top back navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/app/seeker')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center gap-1 min-h-[32px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Post a Problem for Appointment Offers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Specify your task details, budget in ₹, and preferred IST availability windows for verified solvers to offer appointment slots.
        </p>
      </div>

      {/* Escrow Guarantee Callout */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-bold block">100% Milestone Escrow Protection</span>
          Your payment in ₹ is held safely in escrow and only released after your live session is completed and confirmed.
        </div>
      </div>

      {/* Post Form */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-card">
        <PostProblemForm onSuccess={() => navigate('/app/seeker/problems')} />
      </div>
    </div>
  );
};
