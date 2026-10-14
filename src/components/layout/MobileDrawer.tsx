import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-[280px] max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-250 flex flex-col bg-[#0F172A]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-3 p-2 text-slate-400 hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>

        <Sidebar
          isCollapsed={false}
          onToggleCollapse={() => {}}
          className="w-full h-full border-r-0"
          onItemClick={onClose}
        />
      </div>
    </div>
  );
};
