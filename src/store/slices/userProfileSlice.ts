import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Manual UserProfile type to avoid deep type instantiation
export interface UserProfile {
  address: any | null;
  created_at: string;
  id: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'COMPANY-USER';
  surname: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = Date.now();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setProfile, setLoading, setError, clearProfile, updateProfile, clearError } =
  userProfileSlice.actions;

export default userProfileSlice.reducer;
