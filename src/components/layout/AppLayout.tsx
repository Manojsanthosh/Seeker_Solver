import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { contentTheme } = useAuthStore();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-900">
      {/* Desktop Dark Sidebar (lg+) */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer (slide-in) */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Topbar */}
        <Topbar onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Scrollable Page Content Area */}
        <main
          className={cn(
            'flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 transition-colors',
            contentTheme === 'dark' ? 'content-dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
          )}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </div>
  );
};
