import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is restricted, redirect to corresponding workspace
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to={role === 'solver' ? '/app/solver' : '/app/seeker'}
        replace
      />
    );
  }

  return children;
};
