import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { useAuthStore } from '../store/authStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatINR, formatISTDate, formatISTTime } from '../lib/utils';
import {
  Video,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw,
  XCircle,
  Eye,
  CalendarDays,
  ListFilter,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Session, Slot } from '../types';
import { useToast } from '../components/ui/Toast';

export const SessionsPage: React.FC = () => {
  const { sessions, rescheduleSession, acceptReschedule, cancelSession } = useProblemStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed' | 'cancelled'>('upcoming');
  const [viewMode, setViewMode] = useState<'cards' | 'agenda'>('cards');

  // Modal states
  const [rescheduleSessionTarget, setRescheduleSessionTarget] = useState<Session | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [newRescheduleDate, setNewRescheduleDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [newRescheduleTime, setNewRescheduleTime] = useState('04:00 PM');

  const [cancelSessionTarget, setCancelSessionTarget] = useState<Session | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Schedule conflict');

  const [inspectSessionTarget, setInspectSessionTarget] = useState<Session | null>(null);

  // Filter sessions by tab
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'live') return s.status === 'live';
    if (activeTab === 'upcoming')
      return s.status === 'booked' || s.status === 'reschedule_requested';
    if (activeTab === 'completed') return s.status === 'completed';
    if (activeTab === 'cancelled') return s.status === 'cancelled' || s.status === 'no_show';
    return true;
  });

  const liveCount = sessions.filter((s) => s.status === 'live').length;
  const upcomingCount = sessions.filter(
    (s) => s.status === 'booked' || s.status === 'reschedule_requested'
  ).length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const cancelledCount = sessions.filter((s) => s.status === 'cancelled').length;

  const handleRescheduleSubmit = async () => {
    if (!rescheduleSessionTarget) return;
    if (!rescheduleReason.trim()) {
      toastError('Reason Required', 'Please explain why you need to reschedule.');
      return;
    }

    const newSlot: Slot = {
      id: `slot_resched_${Date.now()}`,
      date: newRescheduleDate,
      startTime: newRescheduleTime,
      endTime: '05:00 PM',
    };

    await rescheduleSession(
      rescheduleSessionTarget.id,
      rescheduleReason,
      newSlot,
      user?.role || 'seeker'
    );
    success('Reschedule Requested', 'The other participant has been notified to accept.');
    setRescheduleSessionTarget(null);
    setRescheduleReason('');
  };

  const handleAcceptReschedule = async (sessionId: string) => {
    await acceptReschedule(sessionId);
    success('Reschedule Accepted', 'Your session date and time have been updated.');
  };

  const handleCancelSubmit = async () => {
    if (!cancelSessionTarget) return;
    await cancelSession(cancelSessionTarget.id, cancellationReason);
    success('Session Cancelled', 'Refund policy applied and escrow credited.');
    setCancelSessionTarget(null);
  };

  const getModeIcon = (mode: Session['mode']) => {
    switch (mode) {
      case 'video':
        return <Video className="w-4 h-4 text-indigo-600" />;
      case 'audio':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Live Problem Solving Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Meet, chat, and call with verified specialists to diagnose and resolve tasks live.
          </p>
        </div>

        {/* View Mode Toggle: Cards vs Agenda */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[36px]',
              viewMode === 'cards'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ListFilter className="w-3.5 h-3.5" /> Cards View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[36px]',
              viewMode === 'agenda'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" /> Agenda View
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
          { id: 'live', label: 'Live Now', count: liveCount, pulse: liveCount > 0 },
          { id: 'completed', label: 'Completed', count: completedCount },
          { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-2 min-h-[44px]',
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            {tab.pulse && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px]',
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} sessions found`}
          description={
            activeTab === 'live'
              ? 'There are no active live sessions at this moment.'
              : `You have no ${activeTab} sessions in your schedule. Browse problems or review appointment offers to book one.`
          }
          actionLabel={user?.role === 'solver' ? 'Browse Problems' : 'Post a Problem'}
          onAction={() =>
            navigate(user?.role === 'solver' ? '/app/solver/browse' : '/app/seeker/post')
          }
        />
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSessions.map((sess: Session) => {
            const isSeeker = user?.role === 'seeker';
            const otherParticipantName = isSeeker ? sess.solverName : sess.seekerName;
            const otherParticipantAvatar = isSeeker ? sess.solverAvatar : sess.seekerAvatar;

            return (
              <div
                key={sess.id}
                className={cn(
                  'p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-soft transition-all flex flex-col justify-between text-left space-y-4',
                  sess.status === 'live' && 'ring-2 ring-emerald-500/30 border-emerald-300'
                )}
              >
                <div>
                  {/* Top Bar: Status + Mode Icon + Fee */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sess.status} />
                      <span className="p-1.5 rounded-xl bg-slate-100 flex items-center justify-center">
                        {getModeIcon(sess.mode)}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-slate-900 font-heading">
                      {formatINR(sess.fee)}
                    </span>
                  </div>

                  {/* Problem Title & Category */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                    {sess.problemCategory}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 mt-0.5">
                    {sess.problemTitle}
                  </h3>

                  {/* Other Participant Info */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherParticipantAvatar}
                        alt={otherParticipantName}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {otherParticipantName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {isSeeker ? 'Assigned Solver' : 'Problem Seeker'}
                        </span>
                      </div>
                    </div>

                    {/* Countdown or Status Text */}
                    {sess.countdownText && (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {sess.countdownText}
                      </span>
                    )}
                  </div>

                  {/* Schedule Details in IST */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatISTDate(sess.slot.date)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sess.slot.startTime} - {sess.slot.endTime} IST ({sess.durationMinutes}m)
                    </span>
                  </div>

                  {/* Reschedule banner if requested */}
                  {sess.status === 'reschedule_requested' && sess.rescheduleData && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span>
                          Reschedule Requested by {sess.rescheduleData.requestedBy}:
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                          New: {formatISTDate(sess.rescheduleData.newSlot.date)} • {sess.rescheduleData.newSlot.startTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 italic">
                        "{sess.rescheduleData.reason}"
                      </p>
                      {sess.rescheduleData.requestedBy !== user?.role && (
                        <div className="pt-1 flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptReschedule(sess.id)}
                            className="text-xs py-1 h-7"
                          >
                            Accept New Slot
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectSessionTarget(sess)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="text-xs text-slate-600"
                  >
                    Details
                  </Button>

                  <div className="flex items-center gap-2">
                    {sess.status === 'booked' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRescheduleSessionTarget(sess)}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                          className="text-xs"
                        >
                          Reschedule
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelSessionTarget(sess)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {(sess.status === 'live' || sess.status === 'booked') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/app/sessions/${sess.id}/lobby`)}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className={cn(
                          'shadow-xs',
                          sess.status === 'live' && 'bg-emerald-600 hover:bg-emerald-700'
                        )}
                      >
                        {sess.status === 'live' ? 'Join Live Room' : 'Go to Lobby'}
                      </Button>
                    )}

                    {sess.status === 'completed' && sess.rating && (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        ★ {sess.rating}.0 Rated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Schedule Agenda (Asia/Kolkata IST)
          </h3>
          <div className="divide-y divide-slate-100">
            {filteredSessions.map((sess) => (
              <div
                key={sess.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-center min-w-[70px]">
                    <span className="text-[10px] uppercase font-bold block">
                      {formatISTDate(sess.slot.date).split(' ')[0]}
                    </span>
                    <span className="text-base font-black">
                      {sess.slot.startTime.split(' ')[0]}
                    </span>
                    <span className="text-[9px] uppercase font-bold block">
                      {sess.slot.startTime.split(' ')[1]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sess.status} size="sm" />
                      <span className="text-xs font-bold text-slate-900">
                        {sess.problemTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      With {user?.role === 'seeker' ? sess.solverName : sess.seekerName} •{' '}
                      {formatINR(sess.fee)} • {sess.mode} call
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {(sess.status === 'live' || sess.status === 'booked') && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/app/sessions/${sess.id}/lobby`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleSessionTarget && (
        <Modal
          isOpen={!!rescheduleSessionTarget}
          onClose={() => setRescheduleSessionTarget(null)}
          title="Request Reschedule"
          description={`Propose a new date & time slot for "${rescheduleSessionTarget.problemTitle}"`}
          maxWidth="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleSessionTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRescheduleSubmit}
              >
                Send Reschedule Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left text-xs">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                New Target Date:
              </label>
              <input
                type="date"
                value={newRescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                New Time Slot (IST):
              </label>
              <select
                value={newRescheduleTime}
                onChange={(e) => setNewRescheduleTime(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
              >
                <option value="10:00 AM">10:00 AM IST</option>
                <option value="11:30 AM">11:30 AM IST</option>
                <option value="02:30 PM">02:30 PM IST</option>
                <option value="04:00 PM">04:00 PM IST</option>
                <option value="06:30 PM">06:30 PM IST</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                Reason for Reschedule *:
              </label>
              <textarea
                rows={3}
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Explain the context or reason to the other party..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* CANCEL MODAL WITH INR REFUND POLICY */}
      {cancelSessionTarget && (
        <Modal
          isOpen={!!cancelSessionTarget}
          onClose={() => setCancelSessionTarget(null)}
          title="Cancel Booked Session"
          description={`Are you sure you want to cancel "${cancelSessionTarget.problemTitle}"?`}
          maxWidth="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setCancelSessionTarget(null)}>
                Keep Session
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCancelSubmit}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Confirm Cancellation
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left text-xs">
            {/* Refund Policy Card */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-900 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> SolveBridge Refund Policy in ₹
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>
                  <strong>100% Refund ({formatINR(cancelSessionTarget.totalPaid)}):</strong> if
                  cancelled 6 or more hours prior to scheduled start.
                </li>
                <li>
                  <strong>50% Refund ({formatINR(Math.round(cancelSessionTarget.totalPaid * 0.5))}):</strong> if
                  cancelled within 6 hours of start time.
                </li>
                <li>
                  <strong>No refund:</strong> after session start time or for unnotified no-show.
                </li>
              </ul>
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                Reason for Cancellation:
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Problem resolved internally">Problem resolved internally</option>
                <option value="Booked wrong slot">Booked wrong slot</option>
                <option value="Other">Other reason</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* INSPECT SESSION DETAILS MODAL */}
      {inspectSessionTarget && (
        <Modal
          isOpen={!!inspectSessionTarget}
          onClose={() => setInspectSessionTarget(null)}
          title={inspectSessionTarget.problemTitle}
          description={`Session ID: ${inspectSessionTarget.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-left text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-slate-900">
                  {formatISTDate(inspectSessionTarget.slot.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Window:</span>
                <span className="font-bold text-slate-900">
                  {inspectSessionTarget.slot.startTime} - {inspectSessionTarget.slot.endTime} IST
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agreed Fee:</span>
                <span className="font-bold text-slate-900">{formatINR(inspectSessionTarget.fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Total Paid:</span>
                <span className="font-bold text-indigo-700">
                  {formatINR(inspectSessionTarget.totalPaid)}
                </span>
              </div>
            </div>

            {inspectSessionTarget.review && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">Seeker Review:</span>
                <p className="text-slate-700 italic">"{inspectSessionTarget.review}"</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
