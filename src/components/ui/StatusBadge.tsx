import React from 'react';
import { cn } from '../../lib/utils';
import { ProblemStatus, SessionStatus } from '../../types';

export interface StatusBadgeProps {
  status: ProblemStatus | SessionStatus | 'active' | 'completed' | 'in_review';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; dot: string; pulse?: boolean }
  > = {
    // Problem statuses
    open: {
      label: 'Open',
      bg: 'bg-emerald-50 border-emerald-200/80',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 border-amber-200/80',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-indigo-50 border-indigo-200/80',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
    },
    closed: {
      label: 'Closed',
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
    // Session statuses: Booked = indigo, Live = emerald with pulsing dot, Completed = slate, Cancelled = rose, Reschedule requested = amber.
    offered: {
      label: 'Offer Sent',
      bg: 'bg-sky-50 border-sky-200',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
    },
    booked: {
      label: 'Booked',
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700 font-semibold',
      dot: 'bg-indigo-600',
    },
    live: {
      label: 'Live Now',
      bg: 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20',
      text: 'text-emerald-700 font-bold',
      dot: 'bg-emerald-500',
      pulse: true,
    },
    reschedule_requested: {
      label: 'Reschedule Requested',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800 font-semibold',
      dot: 'bg-amber-500',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-slate-100 border-slate-300',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
    },
    no_show: {
      label: 'No Show',
      bg: 'bg-gray-100 border-gray-300',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
    },
  };

  const current = configs[status] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full capitalize',
        current.bg,
        current.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          current.dot,
          current.pulse && 'animate-ping'
        )}
      />
      {current.label}
    </span>
  );
};
