import { User, UserRole } from '../types';
import { SEED_SEEKER, SEED_SOLVER } from '../mocks/seedData';
import { SeekerRegisterFormData, SolverStep1Data, SolverStep2Data, SolverStep3Data } from '../lib/schemas';
import { generateId } from '../lib/utils';

const STORAGE_USERS_KEY = 'sb_mock_users';
const STORAGE_CURRENT_USER_KEY = 'sb_current_user';
const STORAGE_TOKEN_KEY = 'sb_auth_token';

// Helper to get all registered users (including seed users)
function getAllUsers(): User[] {
  try {
    const customUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
    const customUsers: User[] = customUsersRaw ? JSON.parse(customUsersRaw) : [];
    return [SEED_SEEKER, SEED_SOLVER, ...customUsers];
  } catch {
    return [SEED_SEEKER, SEED_SOLVER];
  }
}

// Helper to save a new user
function saveCustomUser(user: User) {
  try {
    const customUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
    const customUsers: User[] = customUsersRaw ? JSON.parse(customUsersRaw) : [];
    customUsers.push(user);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(customUsers));
  } catch (e) {
    console.error('Failed to save user in localStorage', e);
  }
}

export const mockAuthService = {
  async login(
    emailOrPhone: string,
    password: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> {
    // Simulate real network delay
    await new Promise((res) => setTimeout(res, 400));

    const allUsers = getAllUsers();
    const cleanInput = emailOrPhone.trim().toLowerCase();

    // Check seed credentials or matching user
    const matchedUser = allUsers.find(
      (u) =>
        (u.email.toLowerCase() === cleanInput || u.phone === emailOrPhone) &&
        u.role === role
    );

    if (matchedUser) {
      // Validate password (allow Demo@123 for demo accounts, or min 6 chars)
      if (
        (matchedUser.email === 'seeker@demo.com' || matchedUser.email === 'solver@demo.com') &&
        password !== 'Demo@123'
      ) {
        throw new Error('Invalid credentials. For demo accounts use password: Demo@123');
      }

      const token = `mock_jwt_token_${matchedUser.id}_${Date.now()}`;
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(matchedUser));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      return { user: matchedUser, token };
    }

    // Default fallback for demo testing if user typed something new but valid
    if (password === 'Demo@123' || password.length >= 6) {
      const newUser: User = {
        id: generateId(),
        name: cleanInput.split('@')[0] || 'Demo User',
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@example.com`,
        phone: cleanInput.includes('@') ? '+1 (555) 000-1122' : cleanInput,
        role,
        city: 'New York, NY',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanInput}`,
        createdAt: new Date().toISOString(),
        ...(role === 'seeker'
          ? {
              seekerDetails: {
                totalSpent: 0,
                postedProblemsCount: 0,
                inProgressCount: 0,
                resolvedCount: 0,
              },
            }
          : {
              solverDetails: {
                highestQualification: "Bachelor's",
                fieldOfStudy: 'Software Engineering',
                institution: 'MIT',
                completionYear: '2021',
                experienceYears: 4,
                skills: ['Full Stack Development', 'Problem Solving', 'API Integration'],
                certifications: [],
                documents: [],
                verified: false,
                rating: 5.0,
                completedJobsCount: 0,
                activeJobsCount: 0,
                totalEarnings: 0,
              },
            }),
      };
      saveCustomUser(newUser);
      const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      return { user: newUser, token };
    }

    throw new Error('Invalid email, phone, or password. Please try again.');
  },

  async registerSeeker(data: SeekerRegisterFormData): Promise<{ user: User; token: string }> {
    await new Promise((res) => setTimeout(res, 450));

    const newUser: User = {
      id: `usr_seeker_${generateId()}`,
      name: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: 'seeker',
      city: data.city || 'Remote',
      avatarUrl:
        data.profilePhoto ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
      createdAt: new Date().toISOString(),
      seekerDetails: {
        totalSpent: 0,
        postedProblemsCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
      },
    };

    saveCustomUser(newUser);
    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    return { user: newUser, token };
  },

  async registerSolver(
    step1: SolverStep1Data,
    step2: SolverStep2Data,
    step3: SolverStep3Data
  ): Promise<{ user: User; token: string }> {
    await new Promise((res) => setTimeout(res, 500));

    const newUser: User = {
      id: `usr_solver_${generateId()}`,
      name: step1.fullName,
      email: step1.email.toLowerCase(),
      phone: step1.phone,
      role: 'solver',
      city: step1.city,
      bio: step1.bio,
      avatarUrl:
        step1.profilePhoto ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(step1.fullName)}`,
      createdAt: new Date().toISOString(),
      solverDetails: {
        highestQualification: step2.highestQualification,
        fieldOfStudy: step2.fieldOfStudy,
        institution: step2.institution,
        completionYear: step2.completionYear,
        experienceYears: step2.experienceYears,
        skills: step2.skills,
        certifications: step2.certifications || [],
        documents: step2.documents || [],
        linkedIn: step3.linkedIn,
        instagram: step3.instagram,
        verified: false, // New solver profiles are under review
        rating: 5.0,
        completedJobsCount: 0,
        activeJobsCount: 0,
        totalEarnings: 0,
      },
    };

    saveCustomUser(newUser);
    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    return { user: newUser, token };
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  },
};
