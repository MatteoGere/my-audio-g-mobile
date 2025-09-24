import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tables } from '@/types/supabase-types';
import { EnhancedUserProfile } from '@/types/app-types';

// Types for authentication state - simplified to avoid deep instantiation
export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  role: 'ADMIN' | 'USER' | 'COMPANY-USER';
  address: any | null;
  created_at: string;
  // Enhanced computed fields
  preferences?: any;
  total_favorites?: number;
  total_listening_time?: number;
  completed_itineraries?: number;
  last_activity?: string;
}

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface AuthState {
  user: User | null;
  session: any | null; // Supabase session type
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastActivity: number | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  lastActivity: null,
};

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; session: any }>) => {
      const { user, session } = action.payload;
      state.isLoading = false;
      state.user = user;
      state.session = session;
      state.isAuthenticated = true;
      state.error = null;
      state.lastActivity = Date.now();
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    // Logout actions
    logout: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastActivity = null;
      state.isLoading = false;
    },

    // Profile update
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user.profile = { ...state.user.profile, ...action.payload } as UserProfile;
      }
    },

    // Session management
    updateSession: (state, action: PayloadAction<any>) => {
      state.session = action.payload;
      state.lastActivity = Date.now();
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Activity tracking
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
  updateSession,
  clearError,
  updateLastActivity,
  setLoading,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectSession = (state: { auth: AuthState }) => state.auth.session;
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity;

export default authSlice.reducer;
