import React, { useState } from 'react';
import { useProblemStore } from '../store/problemStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Problem, Offer, Slot } from '../types';
import { formatINR, formatISTDate } from '../lib/utils';
import {
  Search,
  PlusCircle,
  Clock,
  Video,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export const MyProblemsPage: React.FC = () => {
  const { problems, offers } = useProblemStore();
  const navigate = useNavigate();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'offers'>('offers');

  // Selected slot state per offer ID in the modal
  const [selectedSlotMap, setSelectedSlotMap] = useState<Record<string, Slot>>({});

  // Counter-request modal state
  const [counterOfferTarget, setCounterOfferTarget] = useState<Offer | null>(null);
  const [counterDate, setCounterDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [counterWindow, setCounterWindow] = useState('morning');
  const [counterNote, setCounterNote] = useState('');

  const filteredProblems = problems.filter((p: Problem) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' ? true : p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenProblem = (p: Problem, tab: 'overview' | 'offers' = 'offers') => {
    setActiveProblem(p);
    setDetailTab(tab);

    // Initialize default selected slots for each offer
    const problemOffers = offers.filter((o) => o.problemId === p.id);
    const initialMap: Record<string, Slot> = {};
    problemOffers.forEach((o) => {
      if (o.slots.length > 0) {
        // default to first best-match or first slot
        const best = o.slots.find((s) => s.isBestMatch) || o.slots[0];
        initialMap[o.id] = best;
      }
    });
    setSelectedSlotMap(initialMap);
  };

  const handleSelectSlot = (offerId: string, slot: Slot) => {
    setSelectedSlotMap((prev) => ({ ...prev, [offerId]: slot }));
  };

  const handleBookSlot = (offer: Offer) => {
    const slot = selectedSlotMap[offer.id] || offer.slots[0];
    if (!slot) return;
    setActiveProblem(null);
    navigate(`/app/checkout/${offer.id}/${slot.id}`);
  };

  const handleSendCounterRequest = () => {
    if (!counterOfferTarget) return;
    success(
      'Counter-Request Sent',
      `Requested alternative times (${formatISTDate(counterDate)} - ${counterWindow}) to ${counterOfferTarget.solverName}.`
    );
    setCounterOfferTarget(null);
  };

  const columns: Column<Problem>[] = [
    {
      header: 'Title & Category',
      accessorKey: 'title',
      cell: (p: Problem) => (
        <div className="max-w-sm">
          <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
          <span className="text-xs text-indigo-600 font-medium">{p.category}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (p: Problem) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Budget (INR)',
      accessorKey: 'budget',
      cell: (p: Problem) => (
        <span className="font-bold text-slate-900">{formatINR(p.budget)}</span>
      ),
    },
    {
      header: 'Appointment Offers',
      accessorKey: 'offersCount',
      cell: (p: Problem) => {
        const probOffers = offers.filter((o) => o.problemId === p.id);
        const count = probOffers.length || p.offersCount || 0;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProblem(p, 'offers');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>{count} {count === 1 ? 'Offer' : 'Offers'}</span>
          </button>
        );
      },
    },
    {
      header: 'Mode',
      cell: (p: Problem) => (
        <span className="text-xs capitalize font-medium text-slate-700 flex items-center gap-1">
          {p.preferredMode === 'video' ? (
            <Video className="w-3.5 h-3.5 text-indigo-600" />
          ) : p.preferredMode === 'audio' ? (
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
          )}
          {p.preferredMode} ({p.estimatedDuration}m)
        </span>
      ),
    },
    {
      header: 'Deadline',
      accessorKey: 'deadline',
      cell: (p: Problem) => (
        <span className="text-xs text-slate-600">{formatISTDate(p.deadline)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            My Posted Problems
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming appointment offers from verified solvers, book slots, and manage active sessions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/app/seeker/post')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="shadow-elevated self-start sm:self-auto"
        >
          Post a Problem
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Filter problems by title, keywords, or tech stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px]',
                selectedStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problems DataTable */}
      <DataTable
        data={filteredProblems}
        columns={columns}
        keyExtractor={(p: Problem) => p.id}
        onRowClick={(p: Problem) => handleOpenProblem(p, 'offers')}
        emptyState={
          <EmptyState
            title="No problems found"
            description={
              search
                ? `No tasks match your search "${search}". Try resetting your filter.`
                : 'You have not posted any problems yet. Post your challenge to receive appointment slots from certified specialists!'
            }
            actionLabel="Post a Problem"
            onAction={() => navigate('/app/seeker/post')}
          />
        }
        renderMobileCard={(p: Problem) => {
          const probOffers = offers.filter((o) => o.problemId === p.id);
          const count = probOffers.length || p.offersCount || 0;

          return (
            <div
              className="space-y-3 cursor-pointer"
              onClick={() => handleOpenProblem(p, 'offers')}
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
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {count} {count === 1 ? 'Offer' : 'Offers'}
                </span>
              </div>
            </div>
          );
        }}
      />

      {/* PROBLEM DETAIL & OFFERS MODAL / DRAWER */}
      {activeProblem && (
        <Modal
          isOpen={!!activeProblem}
          onClose={() => setActiveProblem(null)}
          title={activeProblem.title}
          description={`Category: ${activeProblem.category} • Budget: ${formatINR(
            activeProblem.budget
          )}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-left text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Tabs inside modal */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setDetailTab('offers')}
                className={cn(
                  'px-3.5 py-2 font-bold text-xs border-b-2 -mb-px transition-all flex items-center gap-1.5',
                  detailTab === 'offers'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Appointment Offers (
                  {offers.filter((o) => o.problemId === activeProblem.id).length}
                  )
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDetailTab('overview')}
                className={cn(
                  'px-3.5 py-2 font-bold text-xs border-b-2 -mb-px transition-all flex items-center gap-1.5',
                  detailTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                Overview & Description
              </button>
            </div>

            {/* TAB 1: OFFERS TAB (CORE FEATURE 4) */}
            {detailTab === 'offers' && (
              <div className="space-y-4">
                {offers.filter((o) => o.problemId === activeProblem.id).length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">No appointment offers yet</p>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      Solvers who match your problem and availability windows will offer slots shortly.
                    </p>
                  </div>
                ) : (
                  offers
                    .filter((o) => o.problemId === activeProblem.id)
                    .map((offer: Offer) => {
                      const activeSelectedSlot =
                        selectedSlotMap[offer.id] || offer.slots[0];

                      return (
                        <div
                          key={offer.id}
                          className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-4 text-left"
                        >
                          {/* Solver Header: Avatar, Name, Verified, Rating, Fee */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={offer.solverAvatar}
                                alt={offer.solverName}
                                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                              />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {offer.solverName}
                                  </h4>
                                  {offer.solverVerified && (
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                  )}
                                  <span className="flex items-center text-amber-500 font-bold text-xs ml-1">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {offer.solverRating}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {offer.solverQualification}
                                </p>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-base font-black text-slate-900 block font-heading">
                                {formatINR(offer.sessionFee)}
                              </span>
                              <span className="text-[11px] text-slate-400 capitalize block">
                                Total: {formatINR(offer.totalPayable)} (with GST)
                              </span>
                            </div>
                          </div>

                          {/* Skills Pills */}
                          <div className="flex flex-wrap gap-1">
                            {offer.solverSkills.map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-white text-indigo-700 rounded-md border border-slate-200"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>

                          {/* Note */}
                          {offer.note && (
                            <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 italic">
                              "{offer.note}"
                            </p>
                          )}

                          {/* Offered Slots as Selectable Chips */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                              Select an Appointment Slot:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {offer.slots.map((slot) => {
                                const isSelected =
                                  activeSelectedSlot?.id === slot.id;

                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => handleSelectSlot(offer.id, slot)}
                                    className={cn(
                                      'px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5',
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : slot.isBestMatch
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 hover:bg-emerald-100'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    )}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {formatISTDate(slot.date)} • {slot.startTime}
                                    </span>
                                    {slot.isBestMatch && !isSelected && (
                                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-600 text-white font-black">
                                        Best Match
                                      </span>
                                    )}
                                    {isSelected && <Check className="w-3.5 h-3.5 text-white ml-0.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Seeker Actions for this Offer */}
                          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Request different time */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCounterOfferTarget(offer)}
                                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                                className="text-xs bg-white"
                              >
                                Request Different Time
                              </Button>

                              {/* Message solver pre-booking */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setActiveProblem(null);
                                  navigate('/app/messages');
                                }}
                                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                                className="text-xs text-slate-600"
                              >
                                Message Solver
                              </Button>
                            </div>

                            {/* Book Selected Slot */}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleBookSlot(offer)}
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                              className="shadow-sm font-bold"
                            >
                              Book Slot & Pay {formatINR(offer.totalPayable)}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {/* TAB 2: OVERVIEW */}
            {detailTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Problem Scope
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    {activeProblem.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Preferred Mode:</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {activeProblem.preferredMode} call ({activeProblem.estimatedDuration}m)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Deadline:</span>
                    <span className="font-bold text-slate-900">
                      {formatISTDate(activeProblem.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* COUNTER-REQUEST MODAL */}
      {counterOfferTarget && (
        <Modal
          isOpen={!!counterOfferTarget}
          onClose={() => setCounterOfferTarget(null)}
          title={`Request Different Time to ${counterOfferTarget.solverName}`}
          description="Send preferred date & time windows for the solver to revise their appointment slots."
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setCounterOfferTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSendCounterRequest}>
                Send Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left text-xs">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                Your Preferred Date:
              </label>
              <input
                type="date"
                value={counterDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCounterDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                Preferred Window (IST):
              </label>
              <select
                value={counterWindow}
                onChange={(e) => setCounterWindow(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
              >
                <option value="morning">Morning (09:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 05:00 PM)</option>
                <option value="evening">Evening (05:00 PM - 09:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                Note for Solver:
              </label>
              <textarea
                rows={2}
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                placeholder="e.g. Free after 4 PM due to standup meeting..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
