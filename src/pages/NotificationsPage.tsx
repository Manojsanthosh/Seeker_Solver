import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Bell,
  Check,
  Calendar,
  CreditCard,
  Video,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationsRead } = useProblemStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'offer':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      case 'booking':
        return <Calendar className="w-5 h-5 text-emerald-600" />;
      case 'reschedule':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'session_reminder':
        return <Video className="w-5 h-5 text-indigo-600" />;
      case 'payment_released':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Notification Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Activity & Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated on appointment offers, booking confirmations, session alerts, and escrow releases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markNotificationsRead()}
            leftIcon={<Check className="w-4 h-4" />}
            className="text-xs"
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          {
            id: 'unread',
            label: 'Unread',
            count: notifications.filter((n) => n.unread).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={cn(
              'px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-2 min-h-[44px]',
              filter === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px]',
                filter === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely caught up! New offers, slot updates, and session reminders will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card divide-y divide-slate-100 overflow-hidden">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.link) navigate(n.link);
              }}
              className={cn(
                'p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors',
                n.unread && 'bg-indigo-50/30'
              )}
            >
              <div className="p-3 rounded-2xl bg-slate-100 flex-shrink-0">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {n.unread && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
