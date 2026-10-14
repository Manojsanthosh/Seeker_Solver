import React, { useState } from 'react';
import { useProblemStore } from '../store/problemStore';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES } from '../mocks/seedData';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Problem } from '../types';
import { formatINR, formatISTDate } from '../lib/utils';
import {
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  Video,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { OfferAppointmentModal } from '../components/appointments/OfferAppointmentModal';
import { cn } from '../lib/utils';

export const BrowseProblemsPage: React.FC = () => {
  const { problems, solverAvailability } = useProblemStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const [appointmentModalProblem, setAppointmentModalProblem] = useState<Problem | null>(null);

  // Helper to check if solver's saved availability overlaps with problem's preferred windows
  const checkMatchesAvailability = (prob: Problem): boolean => {
    if (!prob.preferredAvailability || prob.preferredAvailability.length === 0) {
      return true; // flexible
    }

    return prob.preferredAvailability.some((pw) => {
      // Check if date is blocked
      if (solverAvailability.blockedDates?.includes(pw.date)) return false;

      // Find day of week for this date
      const dateObj = new Date(pw.date);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateObj);

      const daySchedule = solverAvailability.weeklySchedule?.find((s) => s.day === dayName);
      if (!daySchedule || !daySchedule.enabled || daySchedule.slots.length === 0) {
        return false;
      }
      return true;
    });
  };

  // Filter open problems
  const openProblems = problems.filter((p: Problem) => p.status === 'open');

  const filteredProblems = openProblems.filter((p: Problem) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ? true : p.category === selectedCategory;

    const matchesUrgency =
      selectedUrgency === 'all' ? true : p.urgency === selectedUrgency;

    const matchesMode =
      selectedMode === 'all' ? true : p.preferredMode === selectedMode;

    let matchesBudget = true;
    if (selectedBudgetRange === 'under1000') matchesBudget = p.budget < 1000;
    else if (selectedBudgetRange === '1000to2000')
      matchesBudget = p.budget >= 1000 && p.budget <= 2000;
    else if (selectedBudgetRange === 'above2000') matchesBudget = p.budget > 2000;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesUrgency &&
      matchesMode &&
      matchesBudget
    );
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
          SolveBridge Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
          Browse Challenges & Offer Appointment Slots
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review seeker issues, check preferred IST availability windows, and offer appointment slots.
        </p>
      </div>

      {/* Search & Multi-Filters Bar */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-card">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search problems by keywords, tech stack, or bug description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Secondary Filter dropdowns/pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Budget Filter in INR */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Budget in ₹
            </label>
            <select
              value={selectedBudgetRange}
              onChange={(e) => setSelectedBudgetRange(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Budgets (₹)</option>
              <option value="under1000">Under ₹1,000</option>
              <option value="1000to2000">₹1,000 - ₹2,000</option>
              <option value="above2000">Above ₹2,000</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Urgency
            </label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Timelines</option>
              <option value="today">Today</option>
              <option value="this_week">This week</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Session Mode
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="video">Video Call</option>
              <option value="audio">Audio Call</option>
              <option value="chat">Chat Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Categories ({openProblems.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      {filteredProblems.length === 0 ? (
        <EmptyState
          title="No challenges found"
          description={
            search
              ? `No active problems matched "${search}". Try adjusting your keywords or filters.`
              : 'There are no open problems matching these filters right now.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('all');
            setSelectedBudgetRange('all');
            setSelectedUrgency('all');
            setSelectedMode('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProblems.map((prob: Problem) => {
            const matchesAvailability = checkMatchesAvailability(prob);

            return (
              <div
                key={prob.id}
                className={cn(
                  'p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-soft transition-all flex flex-col justify-between text-left space-y-4 relative',
                  matchesAvailability && 'ring-2 ring-emerald-500/20'
                )}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {prob.category}
                    </span>

                    {/* Prominent "Matches your availability" badge */}
                    {matchesAvailability && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Matches your availability
                      </span>
                    )}
                  </div>

                  {/* Title & Budget */}
                  <div className="flex items-start justify-between gap-3 mt-1">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                      {prob.title}
                    </h3>
                    <span className="text-lg font-black text-slate-900 font-heading whitespace-nowrap">
                      {formatINR(prob.budget)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>

                  {/* Mode, Duration & Windows */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        {prob.preferredMode === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-indigo-600" />
                        ) : prob.preferredMode === 'audio' ? (
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="capitalize">{prob.preferredMode} Call ({prob.estimatedDuration}m)</span>
                      </span>

                      <span className="text-slate-500 capitalize font-medium">
                        Urgency: <strong className="text-slate-800">{prob.urgency.replace('_', ' ')}</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <span className="text-slate-400">Preferred Windows (IST): </span>
                      <span className="font-semibold text-slate-800">
                        {prob.preferredAvailability
                          ?.map((pw) => `${formatISTDate(pw.date)} (${pw.timeWindow})`)
                          .join(', ') || 'Flexible'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={prob.seekerAvatar}
                      alt={prob.seekerName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {prob.seekerName}
                    </span>
                  </div>

                  {/* Primary Button: "Offer Appointment" */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAppointmentModalProblem(prob)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="shadow-sm font-bold"
                  >
                    Offer Appointment
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFER APPOINTMENT MODAL */}
      {appointmentModalProblem && (
        <OfferAppointmentModal
          isOpen={!!appointmentModalProblem}
          onClose={() => setAppointmentModalProblem(null)}
          problem={appointmentModalProblem}
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
