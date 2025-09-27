'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { useTheme } from 'next-themes';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Button,
  Select,
  Switch,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  setLanguage,
  setTheme as setThemePreference,
  setAudioQuality,
  setPrivacySettings,
} from '@/lib/redux/slices/userPreferencesSlice';
import {
  serializePreferences,
  parseProfileSettings,
  buildAddressPayload,
} from '@/lib/utils/profile';
import { useAuth } from '@/lib/hooks';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/lib/redux/api/apiSlice';
import { HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';

interface AsyncStatus {
  loading: boolean;
  success: string | null;
  error: string | null;
}

const initialStatus: AsyncStatus = { loading: false, success: null, error: null };

const StatusMessage = ({ status }: { status: AsyncStatus }) => {
  if (status.error) {
    return (
      <div className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-lg px-3 py-2">
        <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />
        <span>{status.error}</span>
      </div>
    );
  }

  if (status.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-lg px-3 py-2">
        <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
        <span>{status.success}</span>
      </div>
    );
  }

  return null;
};

const preferenceOptions: {
  languages: SelectOption[];
  themes: SelectOption[];
  audioQuality: SelectOption[];
} = {
  languages: [
    { label: 'Italiano', value: 'it' },
    { label: 'English', value: 'en' },
  ],
  themes: [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ],
  audioQuality: [
    { label: 'Data Saver', value: 'data-saver' },
    { label: 'Standard', value: 'standard' },
    { label: 'High Fidelity', value: 'high' },
  ],
};

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.userPreferences);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingQuery, error: queryError } =
    useGetUserProfileQuery(user?.id ?? '', { skip: !user?.id });
  const [updateProfileMutation, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const isLoading = isLoadingQuery || isUpdating;
  const error = queryError ? String(queryError) : null;

  const [status, setStatus] = useState<AsyncStatus>(initialStatus);

  const addressSnapshot = useMemo(
    () => parseProfileSettings(profile?.address ?? null).address,
    [profile?.address],
  );

  const handleSavePreferences = async () => {
    setStatus({ loading: true, success: null, error: null });

    try {
      const serializedPreferences = serializePreferences(preferences);
      const payload = buildAddressPayload(addressSnapshot, serializedPreferences);
      if (!user?.id) throw new Error('User not authenticated');
      await updateProfileMutation({ id: user.id, updates: { address: payload } }).unwrap();
      setStatus({ loading: false, success: 'Preferences saved and synced.', error: null });
    } catch (updateError: any) {
      setStatus({
        loading: false,
        success: null,
        error: updateError?.message || 'Unable to persist preferences right now.',
      });
    }
  };

  return (
    <NavigationGuard requireAuth>
      <div className="space-y-6 pb-16">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Control language, theme and audio quality preferences.
              </CardDescription>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
                <HiOutlineChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              <Select
                key={`language-${preferences.language}`}
                label="Language"
                options={preferenceOptions.languages}
                defaultValue={preferences.language}
                onValueChange={(value) => dispatch(setLanguage((value as 'en' | 'it') || 'it'))}
                disabled={isLoading}
              />

              <Select
                key={`theme-${preferences.theme}`}
                label="Theme"
                options={preferenceOptions.themes}
                defaultValue={preferences.theme}
                onValueChange={(value) => {
                  const themeValue = (value as typeof preferences.theme) || 'system';
                  dispatch(setThemePreference(themeValue));
                  setTheme(themeValue);
                }}
                disabled={isLoading}
              />

              <Select
                key={`quality-${preferences.audioSettings.quality}`}
                label="Audio quality"
                options={preferenceOptions.audioQuality}
                defaultValue={preferences.audioSettings.quality}
                onValueChange={(value) =>
                  dispatch(
                    setAudioQuality(
                      (value as typeof preferences.audioSettings.quality) || 'standard',
                    ),
                  )
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                Privacy controls
              </h3>
              <div className="space-y-3">
                <Switch
                  label="Share listening history"
                  description="Use your listening activity to improve recommendations."
                  checked={preferences.privacy.shareListeningHistory}
                  onChange={(event) =>
                    dispatch(setPrivacySettings({ shareListeningHistory: event.target.checked }))
                  }
                  disabled={isLoading}
                />
                <Switch
                  label="Personalized recommendations"
                  description="Allow AI to tailor itineraries based on your profile and favorites."
                  checked={preferences.privacy.personalizedRecommendations}
                  onChange={(event) =>
                    dispatch(
                      setPrivacySettings({ personalizedRecommendations: event.target.checked }),
                    )
                  }
                  disabled={isLoading}
                />
                <Switch
                  label="Location-based suggestions"
                  description="Enable suggestions when you are near points of interest."
                  checked={preferences.privacy.locationBasedSuggestions}
                  onChange={(event) =>
                    dispatch(setPrivacySettings({ locationBasedSuggestions: event.target.checked }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <StatusMessage status={{ loading: false, success: null, error }} />}
            <StatusMessage status={status} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleSavePreferences} loading={status.loading || isLoading}>
                Save preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </NavigationGuard>
  );
}
