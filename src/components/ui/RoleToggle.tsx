import React from 'react';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';
import { HelpCircle, Wrench } from 'lucide-react';

export interface RoleToggleProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleToggle: React.FC<RoleToggleProps> = ({
  value,
  onChange,
  className,
  size = 'md',
}) => {
  return (
    <div
      role="tablist"
      aria-label="Select User Role"
      className={cn(
        'inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner w-full max-w-sm mx-auto',
        size === 'sm' && 'p-1',
        className
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'seeker'}
        onClick={() => onChange('seeker')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold transition-all duration-200 min-h-[44px]',
          value === 'seeker'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        )}
      >
        <HelpCircle className="w-4 h-4" />
        <span>I Need Help (Seeker)</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'solver'}
        onClick={() => onChange('solver')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold transition-all duration-200 min-h-[44px]',
          value === 'solver'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        )}
      >
        <Wrench className="w-4 h-4" />
        <span>I Want to Solve</span>
      </button>
    </div>
  );
};
