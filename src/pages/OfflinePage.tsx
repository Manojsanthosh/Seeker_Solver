import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OfflinePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 shadow-sm">
        <WifiOff className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
        You're Currently Offline
      </h1>
      <p className="mt-2 text-slate-500 max-w-sm text-sm">
        SolveBridge cached your active tasks and profile locally. Once your internet connection is restored, synchronization will resume automatically.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Check Connection & Retry
        </Button>
      </div>
    </div>
  );
};
