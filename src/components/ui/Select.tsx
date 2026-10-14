import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = 'Select an option',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-base text-slate-900 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p className="text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
