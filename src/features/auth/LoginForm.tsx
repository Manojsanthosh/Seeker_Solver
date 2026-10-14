import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../../lib/schemas';
import { useAuthStore } from '../../store/authStore';
import { RoleToggle } from '../../components/ui/RoleToggle';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';
import { Mail, Phone, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { success, error: toastError } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('seeker');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'seeker',
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
    clearError();
  };

  const handleQuickDemoFill = () => {
    if (selectedRole === 'seeker') {
      setValue('emailOrPhone', 'seeker@demo.com');
      setValue('password', 'Demo@123');
    } else {
      setValue('emailOrPhone', 'solver@demo.com');
      setValue('password', 'Demo@123');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.emailOrPhone, data.password, selectedRole);
      success('Welcome back!', `Signed in as ${selectedRole === 'solver' ? 'Solver' : 'Seeker'}`);
      navigate(selectedRole === 'solver' ? '/app/solver' : '/app/seeker');
    } catch (err: any) {
      toastError('Login Failed', err.message || 'Please check your login details');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-left space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select your portal and sign in to manage your tasks.
        </p>
      </div>

      {/* Role Toggle */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Choose Account Type
        </label>
        <RoleToggle value={selectedRole} onChange={handleRoleChange} />
      </div>

      {/* Quick Demo Fill Pill */}
      <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-indigo-900 font-medium">
            Demo: {selectedRole === 'seeker' ? 'seeker@demo.com' : 'solver@demo.com'} (pw: Demo@123)
          </span>
        </div>
        <button
          type="button"
          onClick={handleQuickDemoFill}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline ml-2 flex-shrink-0"
        >
          Auto-fill
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <Input
          label="Email or Phone Number"
          placeholder={
            selectedRole === 'seeker'
              ? 'seeker@demo.com or +1 555-234-5678'
              : 'solver@demo.com or +1 555-876-5432'
          }
          type="text"
          inputMode="email"
          autoComplete="username"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.emailOrPhone?.message}
          {...register('emailOrPhone')}
        />

        <div className="space-y-1">
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                {...register('rememberMe')}
              />
              <span>Remember me</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('For demo accounts, use password: Demo@123');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full justify-center shadow-elevated"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In as {selectedRole === 'solver' ? 'Solver' : 'Seeker'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span>
        </div>
      </div>

      {/* Social Google Login placeholder */}
      <button
        type="button"
        onClick={() => {
          handleQuickDemoFill();
          alert('Google OAuth placeholder clicked. Demo credentials auto-filled.');
        }}
        className="w-full min-h-[44px] flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors shadow-xs"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Switch to Register */}
      <p className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link
          to={`/register?role=${selectedRole}`}
          className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};
