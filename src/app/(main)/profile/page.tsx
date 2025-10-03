'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { Card } from '@/components/ui';
import { useAuth } from '@/lib/hooks';
import { useGetUserProfileQuery } from '@/lib/redux/api/apiSlice';
import { HiOutlineUser, HiOutlineCog, HiOutlineLockClosed, HiOutlineTrash } from 'react-icons/hi2';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useGetUserProfileQuery(user?.id ?? '', { skip: !user?.id });

  const initials = useMemo(() => {
    if (profile?.name && profile?.surname) {
      return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
    }
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [profile?.name, profile?.surname, user?.email]);

  const displayName = useMemo(() => {
    if (profile?.name || profile?.surname) {
      return `${profile?.name || ''} ${profile?.surname || ''}`.trim();
    }
    if (user?.email) {
      return user.email;
    }
    return 'Audio Explorer';
  }, [profile?.name, profile?.surname, user?.email]);

  return (
    <NavigationGuard requireAuth>
      <div className="space-y-6 pb-16">
        {/* Profile Header Card */}
        <Card
          padding="lg"
          variant="glass"
          className="flex items-center gap-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-medium flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground leading-tight">{displayName}</h2>
            <p className="text-sm text-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {user?.email}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-xs text-accent font-semibold uppercase tracking-wide">
                {profile?.role === 'ADMIN'
                  ? 'Administrator'
                  : profile?.role === 'COMPANY-USER'
                    ? 'Curator'
                    : 'Explorer'}
              </p>
            </div>
          </div>
        </Card>

        {/* Settings List */}
        <div className="space-y-2">
          <ul className="flex flex-col gap-2">
            <li>
              <Card
                padding="none"
                variant="glass"
                className="overflow-hidden bg-gradient-to-br from-surface to-primary/5 border border-primary/20 hover:shadow-medium hover:scale-[1.01] transition-all duration-300"
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-5"
                  onClick={() => router.push('/profile/personal-information')}
                  aria-label="Personal Information"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                    <HiOutlineUser className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-base font-semibold text-foreground">
                      Personal Information
                    </span>
                    <span className="block text-xs text-muted mt-0.5">
                      Name, surname, address, email
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-primary font-semibold">Edit →</span>
                </button>
              </Card>
            </li>
            <li>
              <Card
                padding="none"
                variant="glass"
                className="overflow-hidden bg-gradient-to-br from-surface to-accent/5 border border-accent/20 hover:shadow-medium hover:scale-[1.01] transition-all duration-300"
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-5"
                  onClick={() => router.push('/profile/preferences')}
                  aria-label="Preferences"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center backdrop-blur-sm">
                    <HiOutlineCog className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-base font-semibold text-foreground">
                      Preferences
                    </span>
                    <span className="block text-xs text-muted mt-0.5">
                      Language, theme, audio quality, privacy
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-accent font-semibold">Edit →</span>
                </button>
              </Card>
            </li>
            <li>
              <Card
                padding="none"
                variant="glass"
                className="overflow-hidden bg-gradient-to-br from-surface to-secondary/5 border border-secondary/20 hover:shadow-medium hover:scale-[1.01] transition-all duration-300"
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-5"
                  onClick={() => router.push('/profile/password')}
                  aria-label="Password & Security"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center backdrop-blur-sm">
                    <HiOutlineLockClosed className="h-6 w-6 text-secondary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-base font-semibold text-foreground">
                      Password & Security
                    </span>
                    <span className="block text-xs text-muted mt-0.5">
                      Change password, security settings
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-secondary font-semibold">Edit →</span>
                </button>
              </Card>
            </li>
            <li>
              <Card
                padding="none"
                variant="glass"
                className="overflow-hidden bg-gradient-to-br from-surface to-error/5 border border-error/20 hover:shadow-medium hover:scale-[1.01] transition-all duration-300"
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-5"
                  onClick={() => router.push('/profile/danger-zone')}
                  aria-label="Danger Zone"
                >
                  <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center backdrop-blur-sm">
                    <HiOutlineTrash className="h-6 w-6 text-error" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-base font-semibold text-error">Danger Zone</span>
                    <span className="block text-xs text-error/80 mt-0.5">
                      Delete account and data
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-error font-semibold">Delete →</span>
                </button>
              </Card>
            </li>
          </ul>
        </div>
      </div>
    </NavigationGuard>
  );
}
