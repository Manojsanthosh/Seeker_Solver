export type UserRole = 'seeker' | 'solver';

export type QualificationLevel =
  | 'High School'
  | 'Diploma'
  | "Bachelor's"
  | "Master's"
  | 'PhD'
  | 'Other';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface SolverDetails {
  highestQualification: QualificationLevel;
  fieldOfStudy: string;
  institution: string;
  completionYear: string;
  experienceYears: number;
  skills: string[];
  certifications: Certification[];
  documents: UploadedFile[];
  linkedIn?: string;
  instagram?: string;
  verified: boolean;
  rating: number;
  completedJobsCount: number;
  activeJobsCount: number;
  totalEarnings: number;
  hourlyRate?: number;
}

export interface SeekerDetails {
  totalSpent: number;
  postedProblemsCount: number;
  inProgressCount: number;
  resolvedCount: number;
  upcomingSessionsCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  city?: string;
  bio?: string;
  createdAt: string;
  seekerDetails?: SeekerDetails;
  solverDetails?: SolverDetails;
}

export type SessionMode = 'chat' | 'audio' | 'video';
export type SessionUrgency = 'today' | 'this_week' | 'flexible';
export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'custom';

export interface PreferredWindow {
  date: string; // YYYY-MM-DD
  timeWindow: TimeWindow;
  customStart?: string;
  customEnd?: string;
}

export interface Slot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "10:30 AM"
  endTime: string; // e.g., "11:00 AM"
  isBestMatch?: boolean;
  isBooked?: boolean;
}

export type ProblemStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Problem {
  id: string;
  title: string;
  category: string;
  description: string;
  budgetType: 'range' | 'fixed';
  budgetMin?: number;
  budgetMax?: number;
  budget: number; // in ₹
  preferredMode: SessionMode;
  estimatedDuration: 15 | 30 | 45 | 60 | 90; // minutes
  preferredAvailability: PreferredWindow[];
  urgency: SessionUrgency;
  deadline: string;
  status: ProblemStatus;
  seekerId: string;
  seekerName: string;
  seekerAvatar?: string;
  solverId?: string;
  solverName?: string;
  solverAvatar?: string;
  attachments?: UploadedFile[];
  createdAt: string;
  offersCount: number;
  location?: string;
}

export interface Offer {
  id: string;
  problemId: string;
  problemTitle: string;
  solverId: string;
  solverName: string;
  solverAvatar: string;
  solverRating: number;
  solverVerified: boolean;
  solverQualification: string;
  solverSkills: string[];
  slots: Slot[];
  mode: SessionMode;
  durationMinutes: number;
  sessionFee: number; // ₹
  platformFee: number; // 10%
  gst: number; // 18% on platform fee
  totalPayable: number; // sessionFee + platformFee + gst
  note?: string;
  status: 'sent' | 'accepted' | 'declined' | 'rescheduled';
  createdAt: string;
}

export type SessionStatus =
  | 'offered'
  | 'booked'
  | 'reschedule_requested'
  | 'live'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Session {
  id: string;
  problemId: string;
  problemTitle: string;
  problemCategory: string;
  seekerId: string;
  seekerName: string;
  seekerAvatar: string;
  solverId: string;
  solverName: string;
  solverAvatar: string;
  slot: Slot;
  mode: SessionMode;
  durationMinutes: number;
  fee: number; // in ₹
  totalPaid: number; // in ₹
  status: SessionStatus;
  countdownText?: string;
  rescheduleData?: {
    requestedBy: 'seeker' | 'solver';
    reason: string;
    newSlot: Slot;
  };
  cancellationReason?: string;
  refundPolicy?: string;
  refundAmount?: number;
  problemSolved?: boolean;
  notes?: string;
  rating?: number;
  review?: string;
  reviewTags?: string[];
  sharedFiles?: UploadedFile[];
  createdAt: string;
}

export interface WeeklyDaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  enabled: boolean;
  slots: { start: string; end: string }[];
}

export interface SolverAvailability {
  weeklySchedule: WeeklyDaySchedule[];
  blockedDates: string[];
  defaultFeePer30Min: number; // in ₹
  preferredModes: SessionMode[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'offer' | 'booking' | 'reschedule' | 'session_reminder' | 'payment_released';
  link?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  title: string;
  amount: number;
  fee: number;
  net: number;
  status: 'Paid' | 'In Escrow' | 'Released' | 'Refunded';
  invoiceId?: string;
}

export interface Job {
  id: string;
  problemId: string;
  problemTitle: string;
  category: string;
  seekerId: string;
  seekerName: string;
  seekerAvatar?: string;
  budget: number;
  deadline: string;
  status: 'active' | 'completed' | 'in_review';
  startedAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  problemCount: number;
  description: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: 'Seeker' | 'Solver';
  avatarUrl: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachment?: UploadedFile;
}
