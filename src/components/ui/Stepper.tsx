import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StepItem {
  id: number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-4">
      {/* Visual Progress Bar */}
      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-300 z-0"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isCompleted && !isCurrent}
                  onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 border-2',
                    isCompleted
                      ? 'bg-indigo-600 border-indigo-600 text-white cursor-pointer hover:bg-indigo-700'
                      : isCurrent
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-4 ring-indigo-100'
                      : 'bg-white border-slate-300 text-slate-400 cursor-not-allowed'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-white" /> : step.id}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center hidden sm:block',
                    isCurrent ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Title */}
      <div className="text-center sm:hidden">
        <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
          Step {currentStep} of {steps.length}
        </p>
        <p className="text-sm font-bold text-slate-900 mt-0.5">
          {steps.find((s) => s.id === currentStep)?.title}
        </p>
      </div>
    </div>
  );
};
