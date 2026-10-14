import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/ui/Toast';
import { useAuthStore } from './store/authStore';
import { useProblemStore } from './store/problemStore';

export const App: React.FC = () => {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const fetchInitialData = useProblemStore((s) => s.fetchInitialData);

  useEffect(() => {
    initializeAuth();
    fetchInitialData();
  }, [initializeAuth, fetchInitialData]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
