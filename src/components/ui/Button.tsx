import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 focus-visible:ring-indigo-500',
      secondary:
        'bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus-visible:ring-slate-900',
      outline:
        'border border-slate-300 hover:bg-slate-50 text-slate-700 focus-visible:ring-indigo-500',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-indigo-500',
      danger:
        'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200 focus-visible:ring-rose-500',
      subtle:
        'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 focus-visible:ring-indigo-500',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm min-h-[38px]',
      md: 'h-11 px-5 text-base min-h-[44px]', // 44px touch target
      lg: 'h-13 px-7 text-lg min-h-[48px]',
      icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
