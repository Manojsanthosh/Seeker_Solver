import React from 'react';
import { UserRole } from '../../types';
import { HelpCircle, Wrench, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

export interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
  onContinue,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-200">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Step 0 • Account Purpose
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
          How do you plan to use SolveBridge?
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Select your primary intent to customize your onboarding experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Seeker Card */}
        <div
          onClick={() => onSelectRole('seeker')}
          className={cn(
            'p-6 sm:p-7 rounded-3xl border-2 transition-all cursor-pointer text-left relative flex flex-col justify-between group',
            selectedRole === 'seeker'
              ? 'border-indigo-600 bg-indigo-50/30 shadow-elevated ring-4 ring-indigo-100'
              : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 shadow-card'
          )}
        >
          {selectedRole === 'seeker' && (
            <div className="absolute top-4 right-4 text-indigo-600">
              <CheckCircle2 className="w-6 h-6 fill-indigo-600 text-white" />
            </div>
          )}
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">I Need Help (Seeker)</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              I have technical bugs, design tasks, or complex problems I need qualified experts to solve.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                Single 1-minute registration form
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                Post problems with escrow protection
              </div>
            </div>
          </div>
        </div>

        {/* Solver Card */}
        <div
          onClick={() => onSelectRole('solver')}
          className={cn(
            'p-6 sm:p-7 rounded-3xl border-2 transition-all cursor-pointer text-left relative flex flex-col justify-between group',
            selectedRole === 'solver'
              ? 'border-indigo-600 bg-indigo-50/30 shadow-elevated ring-4 ring-indigo-100'
              : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 shadow-card'
          )}
        >
          {selectedRole === 'solver' && (
            <div className="absolute top-4 right-4 text-indigo-600">
              <CheckCircle2 className="w-6 h-6 fill-indigo-600 text-white" />
            </div>
          )}
          <div>
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">I Want to Solve (Solver)</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              I am an experienced engineer, designer, or specialist looking to monetize my verified expertise.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mr-2" />
                3-step credential verification
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mr-2" />
                Earn 90% payout on completed jobs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          disabled={!selectedRole}
          onClick={onContinue}
          className="w-full sm:w-64"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue to Register
        </Button>
      </div>
    </div>
  );
};
