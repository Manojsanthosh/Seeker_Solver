import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-slate-500 max-w-sm text-sm">
        The page you are looking for does not exist or has been moved to another URL.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
