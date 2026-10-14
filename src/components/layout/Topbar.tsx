import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ArrowLeftRight,
  Sun,
  Moon,
  HelpCircle,
  Wrench,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProblemStore } from '../../store/problemStore';
import { cn } from '../../lib/utils';

export interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { user, role, switchRole, contentTheme, toggleContentTheme } = useAuthStore();
  const { notifications, markNotificationsRead } = useProblemStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSwitchRole = () => {
    const nextRole = role === 'seeker' ? 'solver' : 'seeker';
    switchRole(nextRole);
    navigate(nextRole === 'solver' ? '/app/solver' : '/app/seeker');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center space-x-3 flex-1 max-w-lg">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder={
              role === 'solver'
                ? 'Search problems in ₹, categories, availability...'
                : 'Search solvers, sessions, posted challenges...'
            }
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Role Switcher (For Pair Programming / Demoing) */}
        <button
          type="button"
          onClick={handleSwitchRole}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all min-h-[38px]"
          title={`Switch view to ${role === 'seeker' ? 'Solver' : 'Seeker'}`}
        >
          {role === 'seeker' ? (
            <>
              <Wrench className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Switch to Solver</span>
              <span className="sm:hidden">Solver</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Switch to Seeker</span>
              <span className="sm:hidden">Seeker</span>
            </>
          )}
          <ArrowLeftRight className="w-3 h-3 text-indigo-500 ml-0.5" />
        </button>

        {/* Content Theme Toggle */}
        <button
          type="button"
          onClick={toggleContentTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          title="Toggle content light/dark"
          aria-label="Toggle theme"
        >
          {contentTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 text-left">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markNotificationsRead()}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-center text-slate-400">
                    No notifications right now
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.link) navigate(n.link);
                      }}
                      className={cn(
                        'px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors',
                        n.unread && 'bg-indigo-50/40'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/app/notifications');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 focus:outline-none min-h-[40px]"
            aria-label="User profile options"
          >
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`
              }
              alt={user?.name || 'Avatar'}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 text-left">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/app/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/app/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Account Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
