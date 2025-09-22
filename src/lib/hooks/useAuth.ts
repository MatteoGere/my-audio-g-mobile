import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  supabase,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
} from '../redux/api/apiSlice';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateSession,
  clearError as clearAuthError,
  updateLastActivity,
} from '../redux/slices/authSlice';
import type { Session, User } from '@supabase/supabase-js';
import type { Tables } from '@/types/supabase-types';

// Hook for Supabase Auth management
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {
    user,
    session,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RTK Query mutations
  const [signInMutation] = useSignInMutation();
  const [signUpMutation] = useSignUpMutation();
  const [signOutMutation] = useSignOutMutation();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else {
          if (session) {
            dispatch(updateSession(session));
            dispatch(
              loginSuccess({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                },
                session,
              }),
            );
          }
        }
      } catch (err) {
        console.error('Unexpected error getting session:', err);
        setError('Failed to get session');
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);

      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            dispatch(updateSession(session));
            dispatch(
              loginSuccess({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                },
                session,
              }),
            );
            setError(null);
          }
          break;
        case 'SIGNED_OUT':
          dispatch(logout());
          setError(null);
          break;
        case 'TOKEN_REFRESHED':
          if (session) {
            dispatch(updateSession(session));
            dispatch(
              loginSuccess({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                },
                session,
              }),
            );
          }
          break;
        case 'USER_UPDATED':
          if (session) {
            dispatch(
              loginSuccess({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                },
                session,
              }),
            );
          }
          break;
        default:
          break;
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  // Sign in function
  const signIn = useCallback(
    async (email: string, password: string) => {
      dispatch(loginStart());

      try {
        const result = await signInMutation({ email, password }).unwrap();

        if (result.user && result.session) {
          // Get user profile from database
          const { data: profile } = await supabase
            .from('user_profile')
            .select('*')
            .eq('id', result.user.id)
            .single();

          const userData = {
            id: result.user.id,
            email: result.user.email || '',
            profile: profile || undefined,
          };

          dispatch(loginSuccess({ user: userData, session: result.session }));
          return { success: true };
        }

        throw new Error('Invalid response from server');
      } catch (error: any) {
        const errorMessage = error?.message || 'Sign in failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, signInMutation],
  );

  // Sign up function
  const signUp = useCallback(
    async (data: { email: string; password: string; name: string; surname: string }) => {
      dispatch(loginStart());

      try {
        const result = await signUpMutation(data).unwrap();

        if (result.user) {
          // Create user profile in database
          await supabase.from('user_profile').insert({
            id: result.user.id,
            name: data.name,
            surname: data.surname,
            role: 'USER',
          });

          // Note: User will need to verify email before they can sign in
          dispatch(loginFailure('Please check your email to verify your account'));
          return { success: true };
        }

        throw new Error('Invalid response from server');
      } catch (error: any) {
        const errorMessage = error?.message || 'Sign up failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, signUpMutation],
  );

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setError(null);
      await signOutMutation().unwrap();
      dispatch(logout());
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if the API call fails, clear local state
      dispatch(logout());
      setError('Sign out failed, but local session cleared');
    }
  }, [dispatch, signOutMutation]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Refresh session function
  const refreshSession = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        setError(error.message);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Error refreshing session:', err);
      throw err;
    }
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading: isLoading || authLoading,
    error: error || authError,
    signIn,
    signUp,
    signOut,
    refreshSession,
    forgotPassword,
    resetPassword,
    clearError: () => {
      setError(null);
      dispatch(clearAuthError());
    },
    updateActivity: () => dispatch(updateLastActivity()),
  };
};

// Hook for getting current user profile
export const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user?.id) {
        setProfile(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found - this is okay for new users
            setProfile(null);
          } else {
            throw error;
          }
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, isAuthenticated]);

  // Create or update profile
  const updateProfile = async (updates: Partial<Tables<'user_profile'>>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setIsLoading(true);

      // If profile exists, update it; otherwise create it
      let data;
      if (profile) {
        const { data: updateData, error } = await supabase
          .from('user_profile')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        data = updateData;
      } else {
        // Create new profile with required fields
        const { data: createData, error } = await supabase
          .from('user_profile')
          .insert({
            id: user.id,
            name: updates.name || '',
            surname: updates.surname || '',
            role: updates.role || 'USER',
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        data = createData;
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    hasProfile: !!profile,
    clearError: () => setError(null),
  };
};

// Helper hook for checking if user has specific role
export const useUserRole = (requiredRole?: string) => {
  const { profile } = useUserProfile();
  const hasRole = requiredRole ? profile?.role === requiredRole : true;

  return {
    role: profile?.role || null,
    hasRole,
    isUser: profile?.role === 'USER',
    isAdmin: profile?.role === 'ADMIN',
    isCompanyUser: profile?.role === 'COMPANY-USER',
  };
};
