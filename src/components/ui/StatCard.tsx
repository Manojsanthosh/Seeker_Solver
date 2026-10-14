import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'rose';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  colorScheme = 'indigo',
  description,
}) => {
  const schemeStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      iconText: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      iconText: 'text-amber-600',
      border: 'border-amber-100',
    },
    violet: {
      bg: 'bg-violet-50',
      iconText: 'text-violet-600',
      border: 'border-violet-100',
    },
    rose: {
      bg: 'bg-rose-50',
      iconText: 'text-rose-600',
      border: 'border-rose-100',
    },
  };

  const currentScheme = schemeStyles[colorScheme];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-soft transition-all duration-200 text-left">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
            currentScheme.bg,
            currentScheme.iconText
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </h3>
        {(change || description) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center font-semibold',
                  trend === 'up' && 'text-emerald-600',
                  trend === 'down' && 'text-rose-600',
                  trend === 'neutral' && 'text-slate-500'
                )}
              >
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />}
                {change}
              </span>
            )}
            {description && <span className="text-slate-400">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
