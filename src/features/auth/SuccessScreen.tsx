import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../../store/authStore';

export interface SuccessScreenProps {
  role: 'seeker' | 'solver';
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ role }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#8B5CF6', '#10B981', '#38BDF8'],
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const isSolver = role === 'solver';

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6 py-6 animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Registration Complete
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 font-heading">
          {isSolver ? 'Your Profile is Under Review' : 'Welcome to SolveBridge!'}
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {isSolver
            ? 'We have received your degree credentials and skill submissions. Our verification team typically completes audits within 24 hours. In the meantime, explore your solver workspace!'
            : 'Your seeker account is set up and ready to go. You can immediately post your first task or browse qualified solvers.'}
        </p>
      </div>

      {isSolver && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-left flex items-start space-x-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-bold block">Estimated review: 1 business day</span>
            You have full demo access to explore all platform features right away.
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(isSolver ? '/app/solver' : '/app/seeker')}
          className="w-full justify-center shadow-elevated"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Enter Dashboard
        </Button>
      </div>
    </div>
  );
};
