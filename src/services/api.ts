import {
  Problem,
  Job,
  User,
  Category,
  Offer,
  Session,
  SolverAvailability,
  AppNotification,
  PaymentRecord,
  Slot,
  SessionStatus,
} from '../types';
import {
  INITIAL_PROBLEMS,
  INITIAL_OFFERS,
  INITIAL_SESSIONS,
  INITIAL_SOLVER_AVAILABILITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENT_RECORDS,
  INITIAL_SOLVER_PAYOUTS,
  CATEGORIES,
  RECOMMENDED_SOLVERS,
} from '../mocks/seedData';
import { generateId } from '../lib/utils';
import { PostProblemFormData, OfferAppointmentFormData } from '../lib/schemas';

const STORAGE_PROBLEMS_KEY = 'sb_mock_problems_v2';
const STORAGE_OFFERS_KEY = 'sb_mock_offers_v2';
const STORAGE_SESSIONS_KEY = 'sb_mock_sessions_v2';
const STORAGE_AVAILABILITY_KEY = 'sb_mock_availability_v2';
const STORAGE_NOTIFS_KEY = 'sb_mock_notifs_v2';
const STORAGE_PAYMENTS_KEY = 'sb_mock_payments_v2';
const STORAGE_PAYOUTS_KEY = 'sb_mock_payouts_v2';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed saving to ${key}`, e);
  }
}

export const api = {
  // Problems API
  problems: {
    async getAll(): Promise<Problem[]> {
      await new Promise((r) => setTimeout(r, 120));
      return getStored<Problem[]>(STORAGE_PROBLEMS_KEY, INITIAL_PROBLEMS);
    },

    async getById(id: string): Promise<Problem | undefined> {
      await new Promise((r) => setTimeout(r, 100));
      const problems = getStored<Problem[]>(STORAGE_PROBLEMS_KEY, INITIAL_PROBLEMS);
      return problems.find((p) => p.id === id);
    },

    async create(
      data: PostProblemFormData,
      seeker: { id: string; name: string; avatarUrl?: string }
    ): Promise<Problem> {
      await new Promise((r) => setTimeout(r, 250));
      const newProblem: Problem = {
        id: `prob_${generateId()}`,
        title: data.title,
        category: data.category,
        description: data.description,
        budgetType: data.budgetType,
        budget: data.budget,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        preferredMode: data.preferredMode,
        estimatedDuration: data.estimatedDuration as any,
        preferredAvailability: data.preferredAvailability,
        urgency: data.urgency,
        deadline: data.deadline,
        status: 'open',
        seekerId: seeker.id,
        seekerName: seeker.name,
        seekerAvatar: seeker.avatarUrl,
        offersCount: 0,
        createdAt: new Date().toISOString(),
        location: data.location || 'Remote (IST)',
      };

      const existing = getStored<Problem[]>(STORAGE_PROBLEMS_KEY, INITIAL_PROBLEMS);
      const updated = [newProblem, ...existing];
      saveStored(STORAGE_PROBLEMS_KEY, updated);
      return newProblem;
    },

    async updateStatus(id: string, status: Problem['status']): Promise<Problem> {
      await new Promise((r) => setTimeout(r, 150));
      const existing = getStored<Problem[]>(STORAGE_PROBLEMS_KEY, INITIAL_PROBLEMS);
      const problem = existing.find((p) => p.id === id);
      if (!problem) throw new Error('Problem not found');
      problem.status = status;
      saveStored(STORAGE_PROBLEMS_KEY, existing);
      return problem;
    },
  },

  // Appointment Offers API
  offers: {
    async getAll(): Promise<Offer[]> {
      await new Promise((r) => setTimeout(r, 100));
      return getStored<Offer[]>(STORAGE_OFFERS_KEY, INITIAL_OFFERS);
    },

    async getByProblemId(problemId: string): Promise<Offer[]> {
      await new Promise((r) => setTimeout(r, 120));
      const offers = getStored<Offer[]>(STORAGE_OFFERS_KEY, INITIAL_OFFERS);
      return offers.filter((o) => o.problemId === problemId);
    },

    async getSolverOffers(solverId: string): Promise<Offer[]> {
      await new Promise((r) => setTimeout(r, 120));
      const offers = getStored<Offer[]>(STORAGE_OFFERS_KEY, INITIAL_OFFERS);
      return offers.filter((o) => o.solverId === solverId || solverId === '');
    },

    async create(
      problem: Problem,
      data: OfferAppointmentFormData,
      solver: User
    ): Promise<Offer> {
      await new Promise((r) => setTimeout(r, 300));
      const platformFee = Math.round(data.sessionFee * 0.1);
      const gst = Math.round(platformFee * 0.18);
      const totalPayable = data.sessionFee + platformFee + gst;

      const newOffer: Offer = {
        id: `off_${generateId()}`,
        problemId: problem.id,
        problemTitle: problem.title,
        solverId: solver.id,
        solverName: solver.name,
        solverAvatar:
          solver.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${solver.name}`,
        solverRating: solver.solverDetails?.rating || 4.95,
        solverVerified: solver.solverDetails?.verified ?? true,
        solverQualification: `${solver.solverDetails?.highestQualification || "Master's"} ${solver.solverDetails?.institution || 'IIT'}`,
        solverSkills: solver.solverDetails?.skills.slice(0, 4) || ['React', 'TypeScript'],
        slots: data.slots,
        mode: data.mode,
        durationMinutes: data.durationMinutes,
        sessionFee: data.sessionFee,
        platformFee,
        gst,
        totalPayable,
        note: data.note,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };

      const existingOffers = getStored<Offer[]>(STORAGE_OFFERS_KEY, INITIAL_OFFERS);
      saveStored(STORAGE_OFFERS_KEY, [newOffer, ...existingOffers]);

      // Increment offersCount on problem
      const existingProblems = getStored<Problem[]>(STORAGE_PROBLEMS_KEY, INITIAL_PROBLEMS);
      const prob = existingProblems.find((p) => p.id === problem.id);
      if (prob) {
        prob.offersCount = (prob.offersCount || 0) + 1;
        saveStored(STORAGE_PROBLEMS_KEY, existingProblems);
      }

      // Trigger notification to seeker
      await api.notifications.add({
        title: 'New Appointment Offer Received',
        message: `${solver.name} offered ${data.slots.length} slots for "${problem.title}".`,
        time: 'Just now',
        unread: true,
        type: 'offer',
        link: '/app/seeker/problems',
      });

      return newOffer;
    },

    async updateStatus(offerId: string, status: Offer['status']): Promise<Offer> {
      await new Promise((r) => setTimeout(r, 150));
      const existing = getStored<Offer[]>(STORAGE_OFFERS_KEY, INITIAL_OFFERS);
      const offer = existing.find((o) => o.id === offerId);
      if (!offer) throw new Error('Offer not found');
      offer.status = status;
      saveStored(STORAGE_OFFERS_KEY, existing);
      return offer;
    },
  },

  // Sessions API
  sessions: {
    async getAll(): Promise<Session[]> {
      await new Promise((r) => setTimeout(r, 120));
      return getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
    },

    async getById(id: string): Promise<Session | undefined> {
      await new Promise((r) => setTimeout(r, 100));
      const sessions = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      return sessions.find((s) => s.id === id);
    },

    async bookSession(
      offer: Offer,
      selectedSlot: Slot,
      seeker: User,
      paymentMethod: string
    ): Promise<Session> {
      await new Promise((r) => setTimeout(r, 350));
      const newSession: Session = {
        id: `sess_${generateId()}`,
        problemId: offer.problemId,
        problemTitle: offer.problemTitle,
        problemCategory: 'Software & Tech',
        seekerId: seeker.id,
        seekerName: seeker.name,
        seekerAvatar: seeker.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        solverId: offer.solverId,
        solverName: offer.solverName,
        solverAvatar: offer.solverAvatar,
        slot: selectedSlot,
        mode: offer.mode,
        durationMinutes: offer.durationMinutes,
        fee: offer.sessionFee,
        totalPaid: offer.totalPayable,
        status: 'booked',
        countdownText: `Scheduled for ${selectedSlot.date} at ${selectedSlot.startTime}`,
        createdAt: new Date().toISOString(),
      };

      const existingSessions = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      saveStored(STORAGE_SESSIONS_KEY, [newSession, ...existingSessions]);

      // Update offer status
      await api.offers.updateStatus(offer.id, 'accepted');

      // Update problem status to in_progress
      await api.problems.updateStatus(offer.problemId, 'in_progress');

      // Add payment transaction in escrow
      const payments = getStored<PaymentRecord[]>(STORAGE_PAYMENTS_KEY, INITIAL_PAYMENT_RECORDS);
      const newPayment: PaymentRecord = {
        id: `tx_${generateId()}`,
        date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date()),
        title: `Escrow: ${offer.problemTitle}`,
        amount: offer.sessionFee,
        fee: offer.platformFee + offer.gst,
        net: offer.totalPayable,
        status: 'In Escrow',
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      };
      saveStored(STORAGE_PAYMENTS_KEY, [newPayment, ...payments]);

      // Add notification
      await api.notifications.add({
        title: 'Appointment Slot Confirmed',
        message: `Session booked with ${offer.solverName} for ${selectedSlot.date} at ${selectedSlot.startTime} IST. ₹${offer.totalPayable} held in escrow.`,
        time: 'Just now',
        unread: true,
        type: 'booking',
        link: '/app/sessions',
      });

      return newSession;
    },

    async updateStatus(id: string, status: SessionStatus): Promise<Session> {
      await new Promise((r) => setTimeout(r, 150));
      const existing = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      const session = existing.find((s) => s.id === id);
      if (!session) throw new Error('Session not found');
      session.status = status;
      saveStored(STORAGE_SESSIONS_KEY, existing);
      return session;
    },

    async reschedule(
      id: string,
      reason: string,
      newSlot: Slot,
      requestedBy: 'seeker' | 'solver'
    ): Promise<Session> {
      await new Promise((r) => setTimeout(r, 200));
      const existing = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      const session = existing.find((s) => s.id === id);
      if (!session) throw new Error('Session not found');
      session.status = 'reschedule_requested';
      session.rescheduleData = {
        requestedBy,
        reason,
        newSlot,
      };
      saveStored(STORAGE_SESSIONS_KEY, existing);

      await api.notifications.add({
        title: 'Session Reschedule Requested',
        message: `${requestedBy === 'seeker' ? session.seekerName : session.solverName} requested to reschedule session to ${newSlot.date} ${newSlot.startTime}.`,
        time: 'Just now',
        unread: true,
        type: 'reschedule',
        link: '/app/sessions',
      });

      return session;
    },

    async acceptReschedule(id: string): Promise<Session> {
      await new Promise((r) => setTimeout(r, 200));
      const existing = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      const session = existing.find((s) => s.id === id);
      if (!session || !session.rescheduleData) throw new Error('Session or reschedule not found');
      session.slot = session.rescheduleData.newSlot;
      session.status = 'booked';
      session.countdownText = `Rescheduled to ${session.slot.date} at ${session.slot.startTime}`;
      session.rescheduleData = undefined;
      saveStored(STORAGE_SESSIONS_KEY, existing);
      return session;
    },

    async cancel(id: string, reason: string): Promise<Session> {
      await new Promise((r) => setTimeout(r, 200));
      const existing = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      const session = existing.find((s) => s.id === id);
      if (!session) throw new Error('Session not found');
      session.status = 'cancelled';
      session.cancellationReason = reason;
      session.refundAmount = session.totalPaid;
      session.refundPolicy = '100% full refund processed for cancellation requested >6h prior.';
      saveStored(STORAGE_SESSIONS_KEY, existing);
      return session;
    },

    async completeSession(
      id: string,
      problemSolved: boolean,
      rating?: number,
      review?: string,
      tags?: string[]
    ): Promise<Session> {
      await new Promise((r) => setTimeout(r, 250));
      const existing = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      const session = existing.find((s) => s.id === id);
      if (!session) throw new Error('Session not found');
      session.status = 'completed';
      session.problemSolved = problemSolved;
      session.rating = rating;
      session.review = review;
      session.reviewTags = tags;
      saveStored(STORAGE_SESSIONS_KEY, existing);

      // Release payment from escrow
      const payments = getStored<PaymentRecord[]>(STORAGE_PAYMENTS_KEY, INITIAL_PAYMENT_RECORDS);
      const pIndex = payments.findIndex((p) => p.title.includes(session.problemTitle));
      if (pIndex !== -1) {
        payments[pIndex].status = 'Released';
        saveStored(STORAGE_PAYMENTS_KEY, payments);
      }

      // Add payout entry for solver
      const payouts = getStored<PaymentRecord[]>(STORAGE_PAYOUTS_KEY, INITIAL_SOLVER_PAYOUTS);
      const netPayout = Math.round(session.fee * 0.9);
      const newPayout: PaymentRecord = {
        id: `pay_${generateId()}`,
        date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date()),
        title: `Completed Session: ${session.problemTitle} (${session.seekerName})`,
        amount: session.fee,
        fee: Math.round(session.fee * 0.1),
        net: netPayout,
        status: 'Paid',
        invoiceId: `PAY-${Date.now().toString().slice(-6)}`,
      };
      saveStored(STORAGE_PAYOUTS_KEY, [newPayout, ...payouts]);

      await api.notifications.add({
        title: 'Payment Released to Solver',
        message: `₹${netPayout} has been released from escrow to ${session.solverName}.`,
        time: 'Just now',
        unread: true,
        type: 'payment_released',
        link: '/app/payments',
      });

      return session;
    },

    async saveNotes(id: string, notes: string): Promise<Session> {
      const existing = getStored<Session[]>(STORAGE_SESSIONS_KEY, INITIAL_SESSIONS);
      const session = existing.find((s) => s.id === id);
      if (!session) throw new Error('Session not found');
      session.notes = notes;
      saveStored(STORAGE_SESSIONS_KEY, existing);
      return session;
    },
  },

  // Solver Availability API
  availability: {
    async get(solverId: string): Promise<SolverAvailability> {
      await new Promise((r) => setTimeout(r, 100));
      return getStored<SolverAvailability>(STORAGE_AVAILABILITY_KEY, INITIAL_SOLVER_AVAILABILITY);
    },

    async update(solverId: string, availability: SolverAvailability): Promise<SolverAvailability> {
      await new Promise((r) => setTimeout(r, 200));
      saveStored(STORAGE_AVAILABILITY_KEY, availability);
      return availability;
    },
  },

  // Notifications API
  notifications: {
    async getAll(): Promise<AppNotification[]> {
      await new Promise((r) => setTimeout(r, 100));
      return getStored<AppNotification[]>(STORAGE_NOTIFS_KEY, INITIAL_NOTIFICATIONS);
    },

    async markAllAsRead(): Promise<void> {
      const notifs = getStored<AppNotification[]>(STORAGE_NOTIFS_KEY, INITIAL_NOTIFICATIONS);
      const updated = notifs.map((n) => ({ ...n, unread: false }));
      saveStored(STORAGE_NOTIFS_KEY, updated);
    },

    async add(notif: Omit<AppNotification, 'id'>): Promise<AppNotification> {
      const existing = getStored<AppNotification[]>(STORAGE_NOTIFS_KEY, INITIAL_NOTIFICATIONS);
      const newNotif: AppNotification = {
        ...notif,
        id: `notif_${generateId()}`,
      };
      saveStored(STORAGE_NOTIFS_KEY, [newNotif, ...existing]);
      return newNotif;
    },
  },

  // Payments & Payouts API
  payments: {
    async getSeekerPayments(): Promise<PaymentRecord[]> {
      await new Promise((r) => setTimeout(r, 100));
      return getStored<PaymentRecord[]>(STORAGE_PAYMENTS_KEY, INITIAL_PAYMENT_RECORDS);
    },

    async getSolverPayouts(): Promise<PaymentRecord[]> {
      await new Promise((r) => setTimeout(r, 100));
      return getStored<PaymentRecord[]>(STORAGE_PAYOUTS_KEY, INITIAL_SOLVER_PAYOUTS);
    },

    async withdraw(
      amount: number,
      method: 'upi' | 'bank',
      destination: string
    ): Promise<PaymentRecord> {
      await new Promise((r) => setTimeout(r, 300));
      const payouts = getStored<PaymentRecord[]>(STORAGE_PAYOUTS_KEY, INITIAL_SOLVER_PAYOUTS);
      const withdrawalRecord: PaymentRecord = {
        id: `wd_${generateId()}`,
        date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date()),
        title: `Withdrawal via ${method.toUpperCase()} (${destination})`,
        amount,
        fee: 0,
        net: amount,
        status: 'Paid',
        invoiceId: `WD-${Date.now().toString().slice(-6)}`,
      };
      saveStored(STORAGE_PAYOUTS_KEY, [withdrawalRecord, ...payouts]);
      return withdrawalRecord;
    },
  },

  // Solvers Directory API
  solvers: {
    async getRecommended(): Promise<User[]> {
      await new Promise((r) => setTimeout(r, 100));
      return RECOMMENDED_SOLVERS;
    },
  },

  // Categories API
  categories: {
    async getAll(): Promise<Category[]> {
      return CATEGORIES;
    },
  },
};
