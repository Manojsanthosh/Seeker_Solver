import { create } from 'zustand';
import {
  Problem,
  Job,
  Category,
  User,
  Offer,
  Session,
  SolverAvailability,
  AppNotification,
  PaymentRecord,
  Slot,
  SessionStatus,
} from '../types';
import { api } from '../services/api';
import { PostProblemFormData, OfferAppointmentFormData } from '../lib/schemas';
import { INITIAL_SOLVER_AVAILABILITY } from '../mocks/seedData';

interface ProblemState {
  problems: Problem[];
  offers: Offer[];
  sessions: Session[];
  categories: Category[];
  recommendedSolvers: User[];
  solverAvailability: SolverAvailability;
  notifications: AppNotification[];
  seekerPayments: PaymentRecord[];
  solverPayouts: PaymentRecord[];
  isLoading: boolean;

  // Filters
  selectedCategory: string | 'all';
  searchQuery: string;
  statusFilter: string | 'all';
  urgencyFilter: string | 'all';
  modeFilter: string | 'all';
  budgetFilter: string | 'all';

  // Actions
  fetchInitialData: () => Promise<void>;
  createProblem: (
    data: PostProblemFormData,
    seeker: { id: string; name: string; avatarUrl?: string }
  ) => Promise<Problem>;
  updateProblemStatus: (id: string, status: Problem['status']) => Promise<void>;
  createOffer: (
    problem: Problem,
    data: OfferAppointmentFormData,
    solver: User
  ) => Promise<Offer>;
  bookSession: (
    offer: Offer,
    slot: Slot,
    seeker: User,
    paymentMethod: string
  ) => Promise<Session>;
  updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
  rescheduleSession: (
    id: string,
    reason: string,
    newSlot: Slot,
    requestedBy: 'seeker' | 'solver'
  ) => Promise<void>;
  acceptReschedule: (id: string) => Promise<void>;
  cancelSession: (id: string, reason: string) => Promise<void>;
  completeSession: (
    id: string,
    problemSolved: boolean,
    rating?: number,
    review?: string,
    tags?: string[]
  ) => Promise<void>;
  saveSessionNotes: (id: string, notes: string) => Promise<void>;
  updateAvailability: (availability: SolverAvailability) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  withdrawEarnings: (
    amount: number,
    method: 'upi' | 'bank',
    dest: string
  ) => Promise<PaymentRecord>;

  setCategoryFilter: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setUrgencyFilter: (urgency: string) => void;
  setModeFilter: (mode: string) => void;
  setBudgetFilter: (budget: string) => void;
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: [],
  offers: [],
  sessions: [],
  categories: [],
  recommendedSolvers: [],
  solverAvailability: INITIAL_SOLVER_AVAILABILITY,
  notifications: [],
  seekerPayments: [],
  solverPayouts: [],
  isLoading: false,

  selectedCategory: 'all',
  searchQuery: '',
  statusFilter: 'all',
  urgencyFilter: 'all',
  modeFilter: 'all',
  budgetFilter: 'all',

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [
        problems,
        categories,
        solvers,
        offers,
        sessions,
        availability,
        notifications,
        seekerPayments,
        solverPayouts,
      ] = await Promise.all([
        api.problems.getAll(),
        api.categories.getAll(),
        api.solvers.getRecommended(),
        api.offers.getAll(),
        api.sessions.getAll(),
        api.availability.get(''),
        api.notifications.getAll(),
        api.payments.getSeekerPayments(),
        api.payments.getSolverPayouts(),
      ]);

      set({
        problems,
        categories,
        recommendedSolvers: solvers,
        offers,
        sessions,
        solverAvailability: availability,
        notifications,
        seekerPayments,
        solverPayouts,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error fetching initial data', e);
      set({ isLoading: false });
    }
  },

  createProblem: async (data, seeker) => {
    const newProblem = await api.problems.create(data, seeker);
    set((state) => ({
      problems: [newProblem, ...state.problems],
    }));
    return newProblem;
  },

  updateProblemStatus: async (id, status) => {
    const updated = await api.problems.updateStatus(id, status);
    set((state) => ({
      problems: state.problems.map((p) => (p.id === id ? updated : p)),
    }));
  },

  createOffer: async (problem, data, solver) => {
    const newOffer = await api.offers.create(problem, data, solver);
    set((state) => ({
      offers: [newOffer, ...state.offers],
      problems: state.problems.map((p) =>
        p.id === problem.id ? { ...p, offersCount: (p.offersCount || 0) + 1 } : p
      ),
    }));
    return newOffer;
  },

  bookSession: async (offer, slot, seeker, paymentMethod) => {
    const newSession = await api.sessions.bookSession(
      offer,
      slot,
      seeker,
      paymentMethod
    );
    const updatedPayments = await api.payments.getSeekerPayments();
    const updatedNotifs = await api.notifications.getAll();

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      offers: state.offers.map((o) =>
        o.id === offer.id ? { ...o, status: 'accepted' } : o
      ),
      problems: state.problems.map((p) =>
        p.id === offer.problemId ? { ...p, status: 'in_progress' } : p
      ),
      seekerPayments: updatedPayments,
      notifications: updatedNotifs,
    }));
    return newSession;
  },

  updateSessionStatus: async (id, status) => {
    const updated = await api.sessions.updateStatus(id, status);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
    }));
  },

  rescheduleSession: async (id, reason, newSlot, requestedBy) => {
    const updated = await api.sessions.reschedule(id, reason, newSlot, requestedBy);
    const updatedNotifs = await api.notifications.getAll();
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
      notifications: updatedNotifs,
    }));
  },

  acceptReschedule: async (id) => {
    const updated = await api.sessions.acceptReschedule(id);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
    }));
  },

  cancelSession: async (id, reason) => {
    const updated = await api.sessions.cancel(id, reason);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
    }));
  },

  completeSession: async (id, problemSolved, rating, review, tags) => {
    const updated = await api.sessions.completeSession(
      id,
      problemSolved,
      rating,
      review,
      tags
    );
    const [payments, payouts, notifs] = await Promise.all([
      api.payments.getSeekerPayments(),
      api.payments.getSolverPayouts(),
      api.notifications.getAll(),
    ]);

    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
      problems: state.problems.map((p) =>
        p.id === updated.problemId ? { ...p, status: 'resolved' } : p
      ),
      seekerPayments: payments,
      solverPayouts: payouts,
      notifications: notifs,
    }));
  },

  saveSessionNotes: async (id, notes) => {
    const updated = await api.sessions.saveNotes(id, notes);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
    }));
  },

  updateAvailability: async (availability) => {
    const updated = await api.availability.update('', availability);
    set({ solverAvailability: updated });
  },

  markNotificationsRead: async () => {
    await api.notifications.markAllAsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false })),
    }));
  },

  withdrawEarnings: async (amount, method, dest) => {
    const record = await api.payments.withdraw(amount, method, dest);
    set((state) => ({
      solverPayouts: [record, ...state.solverPayouts],
    }));
    return record;
  },

  setCategoryFilter: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setUrgencyFilter: (urgencyFilter) => set({ urgencyFilter }),
  setModeFilter: (modeFilter) => set({ modeFilter }),
  setBudgetFilter: (budgetFilter) => set({ budgetFilter }),
}));
