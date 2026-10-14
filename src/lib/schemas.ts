import { z } from 'zod';
import { validateIndianPhone, validateUPI, validateIFSC } from './utils';

// ========================
// Auth Schemas
// ========================

export const loginSchema = z.object({
  role: z.enum(['seeker', 'solver'], {
    required_error: 'Please select a role',
  }),
  emailOrPhone: z
    .string()
    .min(3, 'Please enter a valid email or phone number')
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val) || validateIndianPhone(val);
    }, 'Enter a valid email address or 10-digit Indian phone number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ========================
// Seeker Registration Schema
// ========================

export const seekerRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Full name is too long'),
    email: z
      .string()
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Please enter a 10-digit phone number')
      .refine(validateIndianPhone, {
        message: 'Enter a valid 10-digit Indian mobile number (starting with 6-9)',
      }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Please confirm your password'),
    city: z.string().optional(),
    profilePhoto: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service & Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SeekerRegisterFormData = z.infer<typeof seekerRegisterSchema>;

// ========================
// Solver Registration Schemas (3 Steps)
// ========================

export const solverStep1Schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Full name is too long'),
    email: z
      .string()
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Please enter a 10-digit phone number')
      .refine(validateIndianPhone, {
        message: 'Enter a valid 10-digit Indian mobile number (starting with 6-9)',
      }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Please confirm your password'),
    city: z
      .string()
      .min(2, 'Please enter your city / location in India (e.g. Bengaluru, Mumbai)'),
    profilePhoto: z.string().optional(),
    bio: z
      .string()
      .min(10, 'Short bio must be at least 10 characters')
      .max(300, 'Bio cannot exceed 300 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SolverStep1Data = z.infer<typeof solverStep1Schema>;

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Certification name required'),
  issuer: z.string().min(2, 'Issuer required'),
  year: z.string().min(4, 'Year required'),
});

export const solverStep2Schema = z.object({
  highestQualification: z.enum(
    ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other'],
    {
      required_error: 'Please select your highest qualification',
    }
  ),
  fieldOfStudy: z
    .string()
    .min(2, 'Field of study / specialization is required'),
  institution: z
    .string()
    .min(2, 'Institution / University name is required'),
  completionYear: z
    .string()
    .min(4, 'Enter a valid 4-digit completion year')
    .max(4, 'Enter a valid 4-digit year'),
  experienceYears: z
    .coerce
    .number()
    .min(0, 'Experience years must be 0 or more')
    .max(60, 'Enter realistic years of experience'),
  skills: z
    .array(z.string())
    .min(1, 'Please add at least one skill or area of expertise'),
  certifications: z.array(certificationItemSchema).default([]),
  documents: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        size: z.number(),
        type: z.string(),
        url: z.string().optional(),
      })
    )
    .default([]),
});

export type SolverStep2Data = z.infer<typeof solverStep2Schema>;

export const solverStep3Schema = z.object({
  linkedIn: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        return (
          val.includes('linkedin.com/') ||
          /^[a-zA-Z0-9_-]{3,60}$/.test(val)
        );
      },
      { message: 'Enter a valid LinkedIn URL or public username' }
    ),
  instagram: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        return /^@?[a-zA-Z0-9._]{1,30}$/.test(val);
      },
      { message: 'Enter a valid Instagram handle (e.g. @rajesh.solves)' }
    ),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms and code of conduct',
  }),
});

export type SolverStep3Data = z.infer<typeof solverStep3Schema>;

// ========================
// Post Problem Schema (INR + Preferred Session Windows)
// ========================

export const preferredWindowSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  timeWindow: z.enum(['morning', 'afternoon', 'evening', 'custom']),
  customStart: z.string().optional(),
  customEnd: z.string().optional(),
});

export const postProblemSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title is too long'),
  category: z.string().min(1, 'Please select a category'),
  description: z
    .string()
    .min(20, 'Please provide more details (at least 20 characters)')
    .max(3000, 'Description too long'),
  budgetType: z.enum(['range', 'fixed']).default('fixed'),
  budget: z.coerce
    .number()
    .min(300, 'Budget must be at least ₹300')
    .max(500000, 'Budget exceeds limit'),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  preferredMode: z.enum(['chat', 'audio', 'video']).default('video'),
  estimatedDuration: z.coerce.number().refine((val) => [15, 30, 45, 60, 90].includes(val), {
    message: 'Estimated duration must be 15, 30, 45, 60, or 90 minutes',
  }),
  preferredAvailability: z.array(preferredWindowSchema).min(1, 'Please select at least one preferred date & time window'),
  urgency: z.enum(['today', 'this_week', 'flexible']).default('this_week'),
  deadline: z.string().min(1, 'Please select a target resolution deadline'),
  location: z.string().optional().default('Remote (IST)'),
});

export type PostProblemFormData = z.infer<typeof postProblemSchema>;

// ========================
// Offer Appointment Schema
// ========================

export const offerAppointmentSchema = z.object({
  slots: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        isBestMatch: z.boolean().optional(),
      })
    )
    .min(1, 'Please select at least one appointment slot')
    .max(5, 'Maximum 5 slots allowed per offer'),
  mode: z.enum(['chat', 'audio', 'video']),
  durationMinutes: z.number().min(15).max(120),
  sessionFee: z.coerce
    .number()
    .min(300, 'Session fee must be at least ₹300')
    .max(100000, 'Fee exceeds limit'),
  note: z.string().max(200, 'Note cannot exceed 200 characters').optional(),
});

export type OfferAppointmentFormData = z.infer<typeof offerAppointmentSchema>;

// ========================
// Solver Withdrawal Schema
// ========================

export const withdrawalSchema = z
  .object({
    method: z.enum(['upi', 'bank']),
    amount: z.coerce.number().min(500, 'Minimum withdrawal is ₹500'),
    upiId: z.string().optional(),
    accountNumber: z.string().optional(),
    confirmAccountNumber: z.string().optional(),
    ifsc: z.string().optional(),
    beneficiaryName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.method === 'upi') {
        return data.upiId && validateUPI(data.upiId);
      }
      return true;
    },
    { message: 'Enter a valid UPI ID (e.g. user@okhdfcbank)', path: ['upiId'] }
  )
  .refine(
    (data) => {
      if (data.method === 'bank') {
        return (
          data.accountNumber &&
          data.accountNumber.length >= 9 &&
          data.accountNumber === data.confirmAccountNumber
        );
      }
      return true;
    },
    { message: 'Bank account numbers must match', path: ['confirmAccountNumber'] }
  )
  .refine(
    (data) => {
      if (data.method === 'bank') {
        return data.ifsc && validateIFSC(data.ifsc);
      }
      return true;
    },
    { message: 'Enter a valid 11-character Indian IFSC code (e.g. HDFC0001234)', path: ['ifsc'] }
  );

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;
