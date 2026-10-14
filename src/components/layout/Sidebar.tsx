import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  MessageSquare,
  CreditCard,
  User,
  Settings,
  Search,
  Video,
  Send,
  CalendarDays,
  TrendingUp,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProblemStore } from '../../store/problemStore';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  className,
  onItemClick,
}) => {
  const { user, role, logout } = useAuthStore();
  const { sessions, offers } = useProblemStore();
  const navigate = useNavigate();

  const liveOrUpcomingSessions = sessions.filter(
    (s) => s.status === 'live' || s.status === 'booked'
  ).length;

  const pendingOffersCount = offers.filter((o) => o.status === 'sent').length;

  const seekerNavItems = [
    { label: 'Overview', to: '/app/seeker', icon: LayoutDashboard },
    { label: 'Post a Problem', to: '/app/seeker/post', icon: PlusCircle },
    { label: 'My Problems', to: '/app/seeker/problems', icon: FolderKanban },
    {
      label: 'Sessions',
      to: '/app/sessions',
      icon: Video,
      badge: liveOrUpcomingSessions > 0 ? String(liveOrUpcomingSessions) : undefined,
    },
    { label: 'Messages', to: '/app/messages', icon: MessageSquare, badge: '2' },
    { label: 'Payments', to: '/app/payments', icon: CreditCard },
    { label: 'Profile', to: '/app/profile', icon: User },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  const solverNavItems = [
    { label: 'Overview', to: '/app/solver', icon: LayoutDashboard },
    { label: 'Browse Problems', to: '/app/solver/browse', icon: Search },
    {
      label: 'My Offers',
      to: '/app/solver/offers',
      icon: Send,
      badge: pendingOffersCount > 0 ? String(pendingOffersCount) : undefined,
    },
    {
      label: 'Sessions',
      to: '/app/sessions',
      icon: Video,
      badge: liveOrUpcomingSessions > 0 ? String(liveOrUpcomingSessions) : undefined,
    },
    { label: 'Messages', to: '/app/messages', icon: MessageSquare, badge: '2' },
    { label: 'Earnings', to: '/app/solver/earnings', icon: TrendingUp },
    { label: 'Availability', to: '/app/solver/availability', icon: CalendarDays },
    { label: 'Profile', to: '/app/profile', icon: User },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  const navItems = role === 'solver' ? solverNavItems : seekerNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'h-full bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-[76px]' : 'w-[260px]',
        className
      )}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading font-extrabold text-base text-white truncate">
                  Solve<span className="text-indigo-400">Bridge</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {role === 'solver' ? 'Solver Workspace' : 'Seeker Workspace'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Role status pill (when not collapsed) */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    role === 'solver' ? 'bg-emerald-400' : 'bg-indigo-400'
                  )}
                />
                <span className="text-xs font-semibold text-slate-200 capitalize">
                  {role === 'solver' ? 'Verified Solver' : 'Problem Seeker'}
                </span>
              </div>
              {role === 'solver' && user?.solverDetails?.verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app/seeker' || item.to === '/app/solver'}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[42px]',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60',
                    isCollapsed && 'justify-center px-2'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/30 text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Card at bottom with logout */}
      <div className="p-3 border-t border-slate-800">
        <div
          className={cn(
            'flex items-center p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`
              }
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Account'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
