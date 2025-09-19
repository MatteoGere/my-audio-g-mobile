'use client';

import { useEffect } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setSession, fetchUserProfile } from '@/store/slices/authSlice';
import { supabase } from '@/store/api/apiSlice';

export default function AuthCallbackPage() {
  const { t } = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=callback_failed');
          return;
        }

        if (data.session) {
          // Update the auth state
          dispatch(setSession({
            user: data.session.user,
            session: data.session,
          }));

          // Fetch user profile
          if (data.session.user) {
            try {
              await dispatch(fetchUserProfile(data.session.user.id)).unwrap();
            } catch (profileError) {
              console.error('Failed to fetch user profile:', profileError);
              // Continue anyway, user might not have a profile yet
            }
          }

          // Check if this is a new user (no profile yet)
          const { data: profileData } = await supabase
            .from('user_profile')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (!profileData) {
            // New user - redirect to onboarding
            router.push('/onboarding');
          } else {
            // Existing user - redirect to home
            router.push('/home');
          }
        } else {
          // No session - redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [dispatch, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  <p className="text-muted">{t('auth.callback.loading')}</p>
      </div>
    </div>
  );
}