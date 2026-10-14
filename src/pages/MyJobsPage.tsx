import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Legacy MyJobsPage - Replaced by the Sessions module (/app/sessions)
 * per appointment + live session architecture.
 */
export const MyJobsPage: React.FC = () => {
  return <Navigate to="/app/sessions" replace />;
};
