import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProblemStore } from '../../store/problemStore';
import { StatCard } from '../../components/ui/StatCard';
import { EarningsChart } from './EarningsChart';
import { Button } from '../../components/ui/Button';
import { formatINR, formatISTDate } from '../../lib/utils';
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  Star,
  ShieldCheck,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { OfferAppointmentModal } from '../../components/appointments/OfferAppointmentModal';
import { Problem } from '../../types';

export const SolverOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { problems, sessions } = useProblemStore();
  const navigate = useNavigate();

  const [appointmentProblem, setAppointmentProblem] = useState<Problem | null>(null);

  const solverDetails = user?.solverDetails || {
    activeJobsCount: 2,
    completedJobsCount: 42,
    totalEarnings: 184500,
    rating: 4.96,
    verified: true,
  };

  // Find next session for solver (live first, or upcoming soonest)
  const nextSession =
    sessions.find((s) => s.status === 'live') ||
    sessions.find((s) => s.status === 'booked') ||
    null;

  const upcomingCount = sessions.filter(
    (s) => s.status === 'booked' || s.status === 'reschedule_requested'
  ).length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const thisMonthEarnings = 68000;

  // Open problems ready for appointment offers
  const openProblems = problems.filter((p) => p.status === 'open').slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-left">
      {/* Top Banner with Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Solver Dashboard
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {solverDetails.verified ? 'Verified IIT Specialist' : 'Review in Progress'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-heading">
            Namaste, {user?.name || 'Dr. Rajesh Raman'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have {upcomingCount} upcoming live sessions scheduled and {openProblems.length} open problems matching your availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/solver/browse')}
            leftIcon={<Search className="w-4 h-4" />}
            className="shadow-elevated"
          >
            Browse Problems
          </Button>
        </div>
      </div>

      {/* "Next Session" Hero Card */}
      {nextSession && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
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
                  {nextSession.status === 'live' ? 'Live Session In Progress' : 'Next Scheduled Session'}
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
                    src={nextSession.seekerAvatar}
                    alt={nextSession.seekerName}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-400"
                  />
                  <span className="font-semibold text-white">Seeker: {nextSession.seekerName}</span>
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
                <span className="text-slate-500">•</span>
                <span className="font-bold text-emerald-400">
                  {formatINR(nextSession.fee)} (Escrow)
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
          title="Upcoming Sessions"
          value={upcomingCount}
          description="Booked appointments"
          colorScheme="indigo"
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="Completed Sessions"
          value={completedCount}
          change="+4 this month"
          trend="up"
          colorScheme="emerald"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          title="This Month Earnings"
          value={formatINR(thisMonthEarnings)}
          change="+18% growth"
          trend="up"
          colorScheme="violet"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Overall Rating"
          value={`${solverDetails.rating} ★`}
          description="Top 1% Solver"
          colorScheme="amber"
          icon={<Star className="w-5 h-5" />}
        />
      </div>

      {/* Grid: Profile Health Card + Recharts Earnings Chart in INR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Card */}
        <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 text-white p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Credentials & Verification
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Verified
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              M.Tech IIT Madras • 8 Yrs Experience
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your credentials, AWS Professional cert, and weekly recurring availability are verified. Solvers offering fast appointment slots receive 4x more bookings.
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Default Rate per 30m:</span>
                <span className="font-bold text-emerald-400">{formatINR(800)}</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[100%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60 mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-400">Escrow Payout: Daily</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/solver/availability')}
              className="text-white border-slate-600 hover:bg-slate-700 text-xs"
            >
              Edit Availability
            </Button>
          </div>
        </div>

        {/* Recharts Chart Component in INR */}
        <div className="lg:col-span-2">
          <EarningsChart />
        </div>
      </div>

      {/* Recommended Open Problems to Offer Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recommended Challenges for You
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-match tasks where seeker preferred availability overlaps with your saved schedule.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/solver/browse')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Browse all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openProblems.map((prob) => (
            <div
              key={prob.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-soft transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {prob.category}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-heading">
                    {formatINR(prob.budget)}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 line-clamp-2">
                  {prob.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {prob.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={prob.seekerAvatar}
                    alt={prob.seekerName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    {prob.seekerName}
                  </span>
                </div>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setAppointmentProblem(prob)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Offer Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offer Appointment Modal */}
      {appointmentProblem && (
        <OfferAppointmentModal
          isOpen={!!appointmentProblem}
          onClose={() => setAppointmentProblem(null)}
          problem={appointmentProblem}
          solver={
            user || {
              id: 'usr_solver_001',
              name: 'Dr. Rajesh Raman',
              email: 'solver@demo.com',
              phone: '+91 98450 12345',
              role: 'solver',
              createdAt: new Date().toISOString(),
            }
          }
        />
      )}
    </div>
  );
};
