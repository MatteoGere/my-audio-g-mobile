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
        <Card padding="lg" className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary shadow-lg flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-semibold">{initials}</span>
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold text-foreground leading-tight">{displayName}</h2>
            <p className="text-sm text-muted">{user?.email}</p>
            <p className="text-xs text-accent font-semibold uppercase tracking-wide">
              {profile?.role === 'ADMIN'
                ? 'Administrator'
                : profile?.role === 'COMPANY-USER'
                  ? 'Curator'
                  : 'Audio Guide Explorer'}
            </p>
          </div>
        </Card>

        <div className="divide-y divide-muted/30">
          <ul className="flex flex-col">
            <li>
              <button
                className="w-full flex items-center gap-4 px-4 py-5 hover:bg-muted/10 transition rounded-lg"
                onClick={() => router.push('/profile/personal-information')}
                aria-label="Personal Information"
              >
                <HiOutlineUser className="h-6 w-6 text-primary" aria-hidden="true" />
                <div className="flex-1 text-left">
                  <span className="block text-base font-medium text-foreground">
                    Personal Information
                  </span>
                  <span className="block text-xs text-muted">Name, surname, address, email</span>
                </div>
                <span className="ml-auto text-xs text-accent font-semibold">Edit</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-4 px-4 py-5 hover:bg-muted/10 transition rounded-lg"
                onClick={() => router.push('/profile/preferences')}
                aria-label="Preferences"
              >
                <HiOutlineCog className="h-6 w-6 text-primary" aria-hidden="true" />
                <div className="flex-1 text-left">
                  <span className="block text-base font-medium text-foreground">Preferences</span>
                  <span className="block text-xs text-muted">
                    Language, theme, audio quality, privacy
                  </span>
                </div>
                <span className="ml-auto text-xs text-accent font-semibold">Edit</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-4 px-4 py-5 hover:bg-muted/10 transition rounded-lg"
                onClick={() => router.push('/profile/password')}
                aria-label="Password & Security"
              >
                <HiOutlineLockClosed className="h-6 w-6 text-primary" aria-hidden="true" />
                <div className="flex-1 text-left">
                  <span className="block text-base font-medium text-foreground">
                    Password & Security
                  </span>
                  <span className="block text-xs text-muted">
                    Change password, security settings
                  </span>
                </div>
                <span className="ml-auto text-xs text-accent font-semibold">Edit</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-4 px-4 py-5 hover:bg-error/10 transition rounded-lg"
                onClick={() => router.push('/profile/danger-zone')}
                aria-label="Danger Zone"
              >
                <HiOutlineTrash className="h-6 w-6 text-error" aria-hidden="true" />
                <div className="flex-1 text-left">
                  <span className="block text-base font-medium text-error">Danger Zone</span>
                  <span className="block text-xs text-error">Delete account and data</span>
                </div>
                <span className="ml-auto text-xs text-error font-semibold">Delete</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </NavigationGuard>
  );
}
