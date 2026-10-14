import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { seekerRegisterSchema, SeekerRegisterFormData } from '../../lib/schemas';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { User, Mail, Phone, MapPin, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export interface SeekerRegisterFormProps {
  onSuccess: () => void;
  onBackToRoles: () => void;
}

export const SeekerRegisterForm: React.FC<SeekerRegisterFormProps> = ({
  onSuccess,
  onBackToRoles,
}) => {
  const { registerSeeker, isLoading, error } = useAuthStore();
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeekerRegisterFormData>({
    resolver: zodResolver(seekerRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SeekerRegisterFormData) => {
    try {
      await registerSeeker(data);
      success('Account created!', 'Welcome to SolveBridge as a Seeker.');
      onSuccess();
    } catch (err: any) {
      toastError('Registration error', err.message || 'Could not complete registration.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-left space-y-6">
      {/* Title */}
      <div>
        <button
          type="button"
          onClick={onBackToRoles}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center"
        >
          ← Change Account Role
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Create Seeker Account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Post problems, receive appointment slot offers from verified experts, and meet in live sessions.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Ananya Sharma"
          type="text"
          autoComplete="name"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            placeholder="you@domain.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Mobile Number (India +91) *"
            placeholder="+91 98765 43210"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordInput
            label="Password *"
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            label="Confirm Password *"
            placeholder="Re-enter password"
            autoComplete="new-password"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Input
          label="City / Location in India (Optional)"
          placeholder="e.g. Bengaluru, Mumbai, Pune, Delhi NCR"
          type="text"
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.city?.message}
          {...register('city')}
        />

        {/* Terms Checkbox */}
        <div className="pt-2">
          <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              {...register('acceptTerms')}
            />
            <span className="leading-snug">
              I agree to the{' '}
              <a href="#terms" className="text-indigo-600 font-semibold hover:underline">
                Terms of Service
              </a>{' '}
              and acknowledge the{' '}
              <a href="#privacy" className="text-indigo-600 font-semibold hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-rose-500 font-medium mt-1">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full justify-center shadow-elevated mt-4"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Seeker Account
        </Button>
      </form>
    </div>
  );
};
