import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Zap, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                Solve<span className="text-indigo-600">Bridge</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1 hidden sm:block">
                Seeker & Solver Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              How it works
            </a>
            <a
              href="#for-seekers"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              For Seekers
            </a>
            <a
              href="#for-solvers"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              For Solvers
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(role === 'solver' ? '/app/solver' : '/app/seeker')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Log out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-semibold shadow-indigo-100"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-1">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              How it works
            </a>
            <a
              href="#for-seekers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              For Seekers
            </a>
            <a
              href="#for-solvers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              For Solvers
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(role === 'solver' ? '/app/solver' : '/app/seeker');
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
