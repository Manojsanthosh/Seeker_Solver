import React, { useState } from 'react';
import { Input, InputProps } from './Input';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrength?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        autoCapitalize="none"
        autoCorrect="off"
        className={className}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-500" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
