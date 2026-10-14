import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  Video,
  MessageSquare,
  User,
  Search,
  LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProblemStore } from '../../store/problemStore';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  isCenter?: boolean;
}

export const BottomNav: React.FC = () => {
  const { role } = useAuthStore();
  const { sessions } = useProblemStore();

  const liveSessionsCount = sessions.filter((s) => s.status === 'live').length;

  const items: NavItem[] = [
    {
      label: 'Home',
      to: role === 'solver' ? '/app/solver' : '/app/seeker',
      icon: Home,
    },
    {
      label: 'Problems',
      to: role === 'solver' ? '/app/solver/browse' : '/app/seeker/problems',
      icon: role === 'solver' ? Search : FolderKanban,
    },
    {
      label: 'Sessions',
      to: '/app/sessions',
      icon: Video,
      isCenter: true,
    },
    {
      label: 'Messages',
      to: '/app/messages',
      icon: MessageSquare,
    },
    {
      label: 'Profile',
      to: '/app/profile',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/seeker' || item.to === '/app/solver'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors select-none min-h-[44px] relative',
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900 active:text-indigo-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1 rounded-xl transition-all relative',
                      item.isCenter &&
                        'bg-indigo-600 text-white p-2.5 shadow-md -mt-4 ring-4 ring-white shadow-indigo-600/30',
                      !item.isCenter && isActive && 'bg-indigo-50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        item.isCenter && 'text-white',
                        !item.isCenter && isActive && 'text-indigo-600'
                      )}
                    />
                    {item.isCenter && liveSessionsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-0.5',
                      item.isCenter && 'font-bold text-indigo-700'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
