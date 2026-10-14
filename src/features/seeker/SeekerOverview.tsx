import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProblemStore } from '../../store/problemStore';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PostProblemForm } from './PostProblemForm';
import { Problem, Session } from '../../types';
import { cn, formatINR, formatISTDate } from '../../lib/utils';
import {
  FolderOpen,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Star,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Video,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

export const SeekerOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { problems, sessions, recommendedSolvers } = useProblemStore();
  const navigate = useNavigate();
  const { success } = useToast();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Compute stat card metrics
  const openCount = problems.filter((p) => p.status === 'open').length;
  const upcomingCount = sessions.filter(
    (s) => s.status === 'booked' || s.status === 'reschedule_requested'
  ).length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const totalSpent = user?.seekerDetails?.totalSpent || 18500;

  // Next session hero card (live first, or upcoming soonest)
  const nextSession =
    sessions.find((s) => s.status === 'live') ||
    sessions.find((s) => s.status === 'booked') ||
    null;

  const seekerProblems = problems.slice(0, 5);

  const columns: Column<Problem>[] = [
    {
      header: 'Problem Title',
      accessorKey: 'title',
      cell: (p) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
          <span className="text-xs text-indigo-600 font-medium">{p.category}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Budget (INR)',
      accessorKey: 'budget',
      cell: (p) => (
        <span className="font-bold text-slate-900">{formatINR(p.budget)}</span>
      ),
    },
    {
      header: 'Deadline',
      accessorKey: 'deadline',
      cell: (p) => (
        <span className="text-xs text-slate-600">{formatISTDate(p.deadline)}</span>
      ),
    },
    {
      header: 'Assigned Solver',
      cell: (p) =>
        p.solverName ? (
          <div className="flex items-center space-x-2">
            <img
              src={
                p.solverAvatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.solverName}`
              }
              alt={p.solverName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-slate-800">{p.solverName}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Open for Offers</span>
        ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Seeker Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-heading">
            Namaste, {user?.name || 'Ananya Sharma'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your incoming appointment offers, next live sessions, and escrow deposits.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsPostModalOpen(true)}
          leftIcon={<PlusCircle className="w-5 h-5" />}
          className="shadow-elevated self-start sm:self-auto"
        >
          Post a Problem
        </Button>
      </div>

      {/* "Next Session" Hero Card */}
      {nextSession && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/60 relative overflow-hidden text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5',
                    nextSession.status === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      nextSession.status === 'live'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-indigo-400'
                    )}
                  />
                  {nextSession.status === 'live' ? 'Live Session In Progress' : 'Next Upcoming Session'}
                </span>

                <span className="text-xs text-indigo-200 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                  {nextSession.countdownText || 'Starts today'}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-1">
                {nextSession.problemTitle}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center space-x-2">
                  <img
                    src={nextSession.solverAvatar}
                    alt={nextSession.solverName}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-400"
                  />
                  <span className="font-semibold text-white">{nextSession.solverName}</span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {formatISTDate(nextSession.slot.date)}
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {nextSession.slot.startTime} - {nextSession.slot.endTime} IST
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/app/sessions/${nextSession.id}/lobby`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className={cn(
                'shadow-elevated self-start md:self-auto min-w-[170px]',
                nextSession.status === 'live'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
                  : 'bg-white hover:bg-slate-100 text-indigo-950 font-extrabold'
              )}
            >
              {nextSession.status === 'live' ? 'Join Live Room' : 'Go to Pre-Join Lobby'}
            </Button>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Problems"
          value={openCount}
          change="+1 this week"
          trend="up"
          colorScheme="indigo"
          icon={<FolderOpen className="w-5 h-5" />}
        />
        <StatCard
          title="Upcoming Sessions"
          value={upcomingCount}
          description="Booked IST slots"
          colorScheme="amber"
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="Completed Sessions"
          value={completedCount}
          change="100% satisfied"
          trend="up"
          colorScheme="emerald"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          title="Total Spent"
          value={formatINR(totalSpent)}
          description="Escrow protected"
          colorScheme="violet"
          icon={<span className="font-bold text-base">₹</span>}
        />
      </div>

      {/* Recent Problems Table / Card list */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Problem Challenges
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any problem to review appointment slot offers from verified solvers.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/seeker/problems')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        </div>

        <DataTable
          data={seekerProblems}
          columns={columns}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => {
            navigate('/app/seeker/problems');
          }}
          renderMobileCard={(p) => (
            <div
              className="space-y-3 cursor-pointer"
              onClick={() => navigate('/app/seeker/problems')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {p.title}
                  </h4>
                </div>
                <StatusBadge status={p.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Budget: </span>
                  <span className="font-bold text-slate-800">{formatINR(p.budget)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Due: </span>
                  <span className="font-medium text-slate-700">{formatISTDate(p.deadline)}</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Recommended Solvers Strip */}
      <div className="space-y-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Top Verified Solvers Available Now
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified engineers and technical specialists ready for immediate live appointment sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedSolvers.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-soft transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={s.avatarUrl}
                      alt={s.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="flex items-center space-x-1">
                        <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                        {s.solverDetails?.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{s.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{s.solverDetails?.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {s.bio}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {s.solverDetails?.skills.slice(0, 3).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 rounded-md"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Rate: {formatINR(s.solverDetails?.hourlyRate || 1200)} / hr
                </span>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    success('Contact initiated', `Opening direct message with ${s.name}`);
                    navigate('/app/messages');
                  }}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post a Problem Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Post a Problem for Appointment Offers"
        description="Describe your task, set a session budget in ₹, and pick preferred IST time windows."
        maxWidth="lg"
      >
        <PostProblemForm onSuccess={() => setIsPostModalOpen(false)} />
      </Modal>
    </div>
  );
};
