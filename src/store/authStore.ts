import { create } from 'zustand';
import { User, UserRole } from '../types';
import { mockAuthService } from '../services/mockAuth';
import { SeekerRegisterFormData, SolverStep1Data, SolverStep2Data, SolverStep3Data } from '../lib/schemas';
import { SEED_SEEKER, SEED_SOLVER } from '../mocks/seedData';

interface AuthState {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  contentTheme: 'light' | 'dark';

  // Actions
  login: (emailOrPhone: string, password: string, role: UserRole) => Promise<void>;
  registerSeeker: (data: SeekerRegisterFormData) => Promise<void>;
  registerSolver: (s1: SolverStep1Data, s2: SolverStep2Data, s3: SolverStep3Data) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  toggleContentTheme: () => void;
  clearError: () => void;
  initialize: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

const getInitialAuth = () => {
  try {
    const current = mockAuthService.getCurrentUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb_auth_token') : null;
    const storedTheme = (typeof window !== 'undefined' ? (localStorage.getItem('sb_content_theme') as 'light' | 'dark') : null) || 'light';
    if (current && token) {
      return {
        user: current,
        role: current.role,
        token,
        isAuthenticated: true,
        contentTheme: storedTheme,
      };
    }
    return {
      user: null,
      role: 'seeker' as UserRole,
      token: null,
      isAuthenticated: false,
      contentTheme: storedTheme,
    };
  } catch {
    return {
      user: null,
      role: 'seeker' as UserRole,
      token: null,
      isAuthenticated: false,
      contentTheme: 'light' as const,
    };
  }
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuth.user,
  role: initialAuth.role,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  isLoading: false,
  error: null,
  contentTheme: initialAuth.contentTheme,

  initialize: () => {
    const current = mockAuthService.getCurrentUser();
    const token = localStorage.getItem('sb_auth_token');
    const storedTheme = (localStorage.getItem('sb_content_theme') as 'light' | 'dark') || 'light';

    if (current && token) {
      set({
        user: current,
        role: current.role,
        token,
        isAuthenticated: true,
        contentTheme: storedTheme,
      });
    } else {
      set({ contentTheme: storedTheme });
    }
  },

  login: async (emailOrPhone, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await mockAuthService.login(emailOrPhone, password, role);
      set({
        user,
        role: user.role,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Login failed. Please check your credentials.',
      });
      throw err;
    }
  },

  registerSeeker: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await mockAuthService.registerSeeker(data);
      set({
        user,
        role: 'seeker',
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Seeker registration failed.',
      });
      throw err;
    }
  },

  registerSolver: async (s1, s2, s3) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await mockAuthService.registerSolver(s1, s2, s3);
      set({
        user,
        role: 'solver',
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Solver registration failed.',
      });
      throw err;
    }
  },

  logout: () => {
    mockAuthService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  switchRole: (newRole: UserRole) => {
    const { user } = get();
    // For convenience in testing/demoing, switch between demo accounts or change active role
    if (newRole === 'seeker') {
      const targetUser = user && user.role === 'seeker' ? user : SEED_SEEKER;
      localStorage.setItem('sb_current_user', JSON.stringify(targetUser));
      set({ user: targetUser, role: 'seeker' });
    } else {
      const targetUser = user && user.role === 'solver' ? user : SEED_SOLVER;
      localStorage.setItem('sb_current_user', JSON.stringify(targetUser));
      set({ user: targetUser, role: 'solver' });
    }
  },

  toggleContentTheme: () => {
    const newTheme = get().contentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('sb_content_theme', newTheme);
    set({ contentTheme: newTheme });
  },

  clearError: () => set({ error: null }),

  updateUser: (updatedFields) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('sb_current_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));
