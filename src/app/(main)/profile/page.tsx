'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  Switch,
  Modal,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { useAuth, useUserProfile } from '@/lib/hooks';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  setLanguage,
  setTheme as setThemePreference,
  setAudioQuality,
  setPrivacySettings,
  type UserPreferencesState,
} from '@/lib/redux/slices/userPreferencesSlice';
import {
  parseProfileSettings,
  serializePreferences,
  buildAddressPayload,
  type ProfileAddress,
} from '@/lib/utils/profile';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
} from 'react-icons/hi2';

interface AsyncStatus {
  loading: boolean;
  success: string | null;
  error: string | null;
}

const initialStatus: AsyncStatus = { loading: false, success: null, error: null };

const createEmptyAddress = (): ProfileAddress => ({
  street: '',
  line2: '',
  city: '',
  province: '',
  postalCode: '',
  country: '',
});

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

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user, session, changePassword, signOut } = useAuth();
  const { profile, isLoading: profileLoading, error: profileError, updateProfile } = useUserProfile();
  const preferences = useAppSelector((state) => state.userPreferences);

  const [personalForm, setPersonalForm] = useState({
    name: '',
    surname: '',
    email: '',
  });
  const [addressForm, setAddressForm] = useState<ProfileAddress>(createEmptyAddress);

  const [personalStatus, setPersonalStatus] = useState<AsyncStatus>(initialStatus);
  const [preferencesStatus, setPreferencesStatus] = useState<AsyncStatus>(initialStatus);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<AsyncStatus>(initialStatus);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<AsyncStatus>(initialStatus);

  useEffect(() => {
    setPersonalForm((prev) => ({
      ...prev,
      email: user?.email || '',
    }));
  }, [user?.email]);

  useEffect(() => {
    if (!profile) {
      setAddressForm(createEmptyAddress());
      return;
    }

    setPersonalForm((prev) => ({
      ...prev,
      name: profile.name || '',
      surname: profile.surname || '',
    }));

    const parsed = parseProfileSettings(profile.address);
    setAddressForm({
      street: parsed.address.street || '',
      line2: parsed.address.line2 || '',
      city: parsed.address.city || '',
      province: parsed.address.province || '',
      postalCode: parsed.address.postalCode || '',
      country: parsed.address.country || '',
    });
  }, [profile]);

  const initials = useMemo(() => {
    if (personalForm.name && personalForm.surname) {
      return `${personalForm.name.charAt(0)}${personalForm.surname.charAt(0)}`.toUpperCase();
    }
    if (personalForm.name) {
      return personalForm.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [personalForm.name, personalForm.surname, user?.email]);

  const displayName = useMemo(() => {
    if (personalForm.name || personalForm.surname) {
      return `${personalForm.name} ${personalForm.surname}`.trim();
    }
    if (user?.email) {
      return user.email;
    }
    return 'Audio Explorer';
  }, [personalForm.name, personalForm.surname, user?.email]);

  const handleAddressChange = (field: keyof ProfileAddress, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildProfilePayload = useCallback(
    (prefs: UserPreferencesState) => buildAddressPayload(addressForm, serializePreferences(prefs)),
    [addressForm],
  );

  const handleSaveProfile = async () => {
    if (!personalForm.name.trim() || !personalForm.surname.trim()) {
      setPersonalStatus({ loading: false, success: null, error: 'Name and surname are required.' });
      return;
    }

    setPersonalStatus({ loading: true, success: null, error: null });

    try {
      await updateProfile({
        name: personalForm.name.trim(),
        surname: personalForm.surname.trim(),
        address: buildProfilePayload(preferences),
      });
      setPersonalStatus({ loading: false, success: 'Profile updated successfully.', error: null });
    } catch (error: any) {
      setPersonalStatus({
        loading: false,
        success: null,
        error: error?.message || 'Unable to update profile right now.',
      });
    }
  };

  const handleSavePreferences = async () => {
    setPreferencesStatus({ loading: true, success: null, error: null });

    try {
      await updateProfile({ address: buildProfilePayload(preferences) });
      setPreferencesStatus({
        loading: false,
        success: 'Preferences saved and synced.',
        error: null,
      });
    } catch (error: any) {
      setPreferencesStatus({
        loading: false,
        success: null,
        error: error?.message || 'Unable to persist preferences.',
      });
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordStatus({ loading: false, success: null, error: 'All password fields are required.' });
      return;
    }

    if (passwordForm.next.length < 8) {
      setPasswordStatus({
        loading: false,
        success: null,
        error: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordStatus({ loading: false, success: null, error: 'Passwords do not match.' });
      return;
    }

    setPasswordStatus({ loading: true, success: null, error: null });

    const result = await changePassword(passwordForm.current, passwordForm.next);
    if (result.success) {
      setPasswordStatus({ loading: false, success: 'Password updated successfully.', error: null });
      setPasswordForm({ current: '', next: '', confirm: '' });
    } else {
      setPasswordStatus({
        loading: false,
        success: null,
        error: result.error || 'Unable to update password.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toUpperCase() !== 'DELETE') {
      setDeleteStatus({
        loading: false,
        success: null,
        error: "Please type 'DELETE' to confirm.",
      });
      return;
    }

    if (!session?.access_token) {
      setDeleteStatus({
        loading: false,
        success: null,
        error: 'Session expired. Please sign in again.',
      });
      return;
    }

    setDeleteStatus({ loading: true, success: null, error: null });

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Account deletion failed.');
      }

      setDeleteStatus({ loading: false, success: 'Account deleted successfully.', error: null });
      setDeleteModalOpen(false);
      await signOut();
      router.push('/');
    } catch (error: any) {
      setDeleteStatus({
        loading: false,
        success: null,
        error: error?.message || 'Unable to delete account right now.',
      });
    }
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

  const hydrationPending = profileLoading && !profile;

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

        {hydrationPending && (
          <Card padding="lg" className="animate-pulse">
            <div className="h-4 bg-muted/60 rounded w-1/3" />
            <div className="mt-4 space-y-3">
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
            </div>
          </Card>
        )}

        {profileError && (
          <div className="flex items-center gap-2 text-sm text-error bg-error/10 rounded-lg px-3 py-2">
            <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Personal Information */}
        <Card padding="lg" className="space-y-6">
          <CardHeader className="space-y-1">
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Update your public profile details. These help us personalize your audio itineraries.
            </CardDescription>
          </CardHeader>

          <CardBody className="space-y-5">
            <div className="grid gap-4">
              <Input
                label="Name"
                value={personalForm.name}
                onChange={(event) => setPersonalForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Your name"
              />
              <Input
                label="Surname"
                value={personalForm.surname}
                onChange={(event) =>
                  setPersonalForm((prev) => ({ ...prev, surname: event.target.value }))
                }
                placeholder="Your surname"
              />
              <Input label="Email" value={personalForm.email} disabled helperText="Email comes from Supabase Auth." />
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Address</h3>
              <Input
                label="Street"
                value={addressForm.street}
                onChange={(event) => handleAddressChange('street', event.target.value)}
                placeholder="Via, street number"
              />
              <Input
                label="Address line 2"
                value={addressForm.line2 || ''}
                onChange={(event) => handleAddressChange('line2', event.target.value)}
                placeholder="Apartment, suite, etc."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={addressForm.city}
                  onChange={(event) => handleAddressChange('city', event.target.value)}
                />
                <Input
                  label="Province"
                  value={addressForm.province}
                  onChange={(event) => handleAddressChange('province', event.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal code"
                  value={addressForm.postalCode}
                  onChange={(event) => handleAddressChange('postalCode', event.target.value)}
                />
                <Input
                  label="Country"
                  value={addressForm.country}
                  onChange={(event) => handleAddressChange('country', event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage status={personalStatus} />
              <div className="flex gap-3 sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!profile) {
                      setAddressForm(createEmptyAddress());
                      setPersonalForm((prev) => ({ ...prev, name: '', surname: '' }));
                      return;
                    }

                    const parsed = parseProfileSettings(profile.address);
                    setPersonalForm((prev) => ({
                      ...prev,
                      name: profile.name || '',
                      surname: profile.surname || '',
                    }));
                    setAddressForm({
                      street: parsed.address.street || '',
                      line2: parsed.address.line2 || '',
                      city: parsed.address.city || '',
                      province: parsed.address.province || '',
                      postalCode: parsed.address.postalCode || '',
                      country: parsed.address.country || '',
                    });
                    setPersonalStatus(initialStatus);
                  }}
                >
                  Reset
                </Button>
                <Button onClick={handleSaveProfile} loading={personalStatus.loading}>
                  Save changes
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Preferences */}
        <Card padding="lg" className="space-y-6">
          <CardHeader className="space-y-1">
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Tailor the app to your needs. These preferences sync to all your devices.
            </CardDescription>
          </CardHeader>

          <CardBody className="space-y-6">
            <div className="grid gap-4">
              <Select
                key={`language-${preferences.language}`}
                label="Language"
                options={preferenceOptions.languages}
                defaultValue={preferences.language}
                onValueChange={(value) =>
                  dispatch(setLanguage((value as 'en' | 'it') || 'it'))
                }
              />

              <Select
                key={`theme-${preferences.theme}`}
                label="Theme"
                options={preferenceOptions.themes}
                defaultValue={preferences.theme}
                onValueChange={(value) => {
                  const themeValue = (value as UserPreferencesState['theme']) || 'system';
                  dispatch(setThemePreference(themeValue));
                  setTheme(themeValue);
                }}
              />

              <Select
                key={`quality-${preferences.audioSettings.quality}`}
                label="Audio quality"
                options={preferenceOptions.audioQuality}
                defaultValue={preferences.audioSettings.quality}
                onValueChange={(value) =>
                  dispatch(
                    setAudioQuality((value as UserPreferencesState['audioSettings']['quality']) || 'standard'),
                  )
                }
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
                    dispatch(
                      setPrivacySettings({ shareListeningHistory: event.target.checked }),
                    )
                  }
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
                />
                <Switch
                  label="Location-based suggestions"
                  description="Enable suggestions when you are near points of interest."
                  checked={preferences.privacy.locationBasedSuggestions}
                  onChange={(event) =>
                    dispatch(
                      setPrivacySettings({ locationBasedSuggestions: event.target.checked }),
                    )
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage status={preferencesStatus} />
              <Button onClick={handleSavePreferences} loading={preferencesStatus.loading}>
                Save preferences
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Password management */}
        <Card padding="lg" className="space-y-6">
          <CardHeader className="space-y-1">
            <CardTitle>Password & security</CardTitle>
            <CardDescription>
              Keep your account secure by using a strong password you do not reuse elsewhere.
            </CardDescription>
          </CardHeader>

          <CardBody className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={passwordForm.current}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
              placeholder="Enter current password"
            />
            <Input
              label="New password"
              type="password"
              value={passwordForm.next}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
              placeholder="Choose a new password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwordForm.confirm}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
              placeholder="Repeat the new password"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage status={passwordStatus} />
              <Button onClick={handlePasswordUpdate} loading={passwordStatus.loading}>
                Update password
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card padding="lg" className="border border-error/30 bg-error/5 space-y-4">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-error">
              <HiOutlineTrash className="h-5 w-5" aria-hidden="true" />
              <CardTitle className="text-error">Danger zone</CardTitle>
            </div>
            <CardDescription>
              Deleting your account removes your profile, favorites, and listening history. This
              action is irreversible.
            </CardDescription>
          </CardHeader>

          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusMessage status={deleteStatus} />
            <Button variant="ghost" className="text-error" onClick={() => {
              setDeleteModalOpen(true);
              setDeleteStatus(initialStatus);
              setDeleteConfirmation('');
            }}>
              Delete account
            </Button>
          </CardBody>
        </Card>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm account deletion"
          description="Type DELETE and confirm to permanently remove your account."
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted">
              This will remove your profile, favorites, listening history, and any personalized
              settings. You will need to create a new account to use the app again.
            </p>
            <Input
              label="Confirmation"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-error text-primary-foreground hover:bg-error/90"
                onClick={handleDeleteAccount}
                loading={deleteStatus.loading}
              >
                Permanently delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </NavigationGuard>
  );
}
