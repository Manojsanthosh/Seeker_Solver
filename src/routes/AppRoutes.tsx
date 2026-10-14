import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AppLayout } from '../components/layout/AppLayout';
import { SeekerDashboardPage } from '../pages/SeekerDashboardPage';
import { PostProblemPage } from '../pages/PostProblemPage';
import { MyProblemsPage } from '../pages/MyProblemsPage';
import { SolverDashboardPage } from '../pages/SolverDashboardPage';
import { BrowseProblemsPage } from '../pages/BrowseProblemsPage';
import { MyOffersPage } from '../pages/MyOffersPage';
import { AvailabilityPage } from '../pages/AvailabilityPage';
import { SessionsPage } from '../pages/SessionsPage';
import { SessionLobbyPage } from '../pages/SessionLobbyPage';
import { SessionRoomPage } from '../pages/SessionRoomPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { MessagesPage } from '../pages/MessagesPage';
import { EarningsPage } from '../pages/EarningsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OfflinePage } from '../pages/OfflinePage';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';

export const AppRoutes: React.FC = () => {
  const { role } = useAuthStore();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/offline" element={<OfflinePage />} />

      {/* Authenticated Dashboard Shell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default /app redirect based on role */}
        <Route
          index
          element={<Navigate to={role === 'solver' ? '/app/solver' : '/app/seeker'} replace />}
        />

        {/* Seeker Routes */}
        <Route
          path="seeker"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <SeekerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="seeker/post"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <PostProblemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="seeker/problems"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <MyProblemsPage />
            </ProtectedRoute>
          }
        />

        {/* Solver Routes */}
        <Route
          path="solver"
          element={
            <ProtectedRoute allowedRoles={['solver']}>
              <SolverDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="solver/browse"
          element={
            <ProtectedRoute allowedRoles={['solver']}>
              <BrowseProblemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="solver/offers"
          element={
            <ProtectedRoute allowedRoles={['solver']}>
              <MyOffersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="solver/availability"
          element={
            <ProtectedRoute allowedRoles={['solver']}>
              <AvailabilityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="solver/earnings"
          element={
            <ProtectedRoute allowedRoles={['solver']}>
              <EarningsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Appointment & Session Flow Routes */}
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/:id/lobby" element={<SessionLobbyPage />} />
        <Route path="sessions/:id/room" element={<SessionRoomPage />} />
        <Route path="checkout/:offerId/:slotId" element={<CheckoutPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Shared Dashboard Routes */}
        <Route path="messages" element={<MessagesPage />} />
        <Route path="payments" element={<EarningsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
