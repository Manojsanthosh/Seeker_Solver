import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { RoleSelector } from '../features/auth/RoleSelector';
import { SeekerRegisterForm } from '../features/auth/SeekerRegisterForm';
import { SolverRegisterWizard } from '../features/auth/SolverRegisterWizard';
import { SuccessScreen } from '../features/auth/SuccessScreen';
import { Zap, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role') as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialRoleParam === 'solver' || initialRoleParam === 'seeker'
      ? initialRoleParam
      : null
  );
  const [hasConfirmedRole, setHasConfirmedRole] = useState<boolean>(
    Boolean(initialRoleParam)
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialRoleParam === 'seeker' || initialRoleParam === 'solver') {
      setSelectedRole(initialRoleParam);
      setHasConfirmedRole(true);
    }
  }, [initialRoleParam]);

  const handleBackToRoles = () => {
    setHasConfirmedRole(false);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
            Solve<span className="text-indigo-600">Bridge</span>
          </span>
        </Link>

        <div className="text-sm text-slate-600">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="my-auto w-full max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-10">
        {isSuccess ? (
          <SuccessScreen role={selectedRole || 'seeker'} />
        ) : !hasConfirmedRole ? (
          <RoleSelector
            selectedRole={selectedRole}
            onSelectRole={(role) => setSelectedRole(role)}
            onContinue={() => setHasConfirmedRole(true)}
          />
        ) : selectedRole === 'seeker' ? (
          <SeekerRegisterForm
            onSuccess={() => setIsSuccess(true)}
            onBackToRoles={handleBackToRoles}
          />
        ) : (
          <SolverRegisterWizard
            onSuccess={() => setIsSuccess(true)}
            onBackToRoles={handleBackToRoles}
          />
        )}
      </div>

      {/* Footer info */}
      <div className="max-w-4xl mx-auto w-full pt-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} SolveBridge Inc. All rights reserved.</span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          256-bit Encrypted SSL & Escrow Protection
        </span>
      </div>
    </div>
  );
};
