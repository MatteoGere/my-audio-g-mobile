'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Button,
  Input,
} from '@/components/ui';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { useAuth } from '@/lib/hooks';
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from '@/lib/redux/api/apiSlice';
import { useAppDispatch } from '@/lib/redux/store';
import { useAppSelector } from '@/lib/redux/store';
import {
  serializePreferences,
  parseProfileSettings,
  buildAddressPayload,
  type ProfileAddress,
} from '@/lib/utils/profile';
import { HiOutlineExclamationTriangle, HiOutlineCheckCircle } from 'react-icons/hi2';

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

export default function PersonalInformationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { data: profile, isLoading: isLoadingQuery, error: queryError } =
    useGetUserProfileQuery(user?.id ?? '', { skip: !user?.id });
  const [updateProfileMutation, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const isLoading = isLoadingQuery || isUpdating;
  const error = queryError ? String(queryError) : null;
  const preferences = useAppSelector((state) => state.userPreferences);

  const [personalForm, setPersonalForm] = useState({
    name: '',
    surname: '',
    email: '',
  });
  const [addressForm, setAddressForm] = useState<ProfileAddress>(createEmptyAddress());
  const [status, setStatus] = useState<AsyncStatus>(initialStatus);
  const addressPayload = useMemo(() => {
    const serialized = serializePreferences(preferences);
    return buildAddressPayload(addressForm, serialized);
  }, [addressForm, preferences]);

  useEffect(() => {
    setPersonalForm((prev) => ({ ...prev, email: user?.email || '' }));
  }, [user?.email]);

  useEffect(() => {
    if (!profile) {
      setAddressForm(createEmptyAddress());
      setPersonalForm((prev) => ({ ...prev, name: '', surname: '' }));
      return;
    }

    setPersonalForm((prev) => ({
      ...prev,
      name: profile.name || '',
      surname: profile.surname || '',
      email: user?.email || prev.email,
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
  }, [profile, user?.email]);

  const handleAddressChange = (field: keyof ProfileAddress, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (!profile) {
      setAddressForm(createEmptyAddress());
      setPersonalForm({ name: '', surname: '', email: user?.email || '' });
      setStatus(initialStatus);
      return;
    }

    const parsed = parseProfileSettings(profile.address);
    setAddressForm({
      street: parsed.address.street || '',
      line2: parsed.address.line2 || '',
      city: parsed.address.city || '',
      province: parsed.address.province || '',
      postalCode: parsed.address.postalCode || '',
      country: parsed.address.country || '',
    });

    setPersonalForm({
      name: profile.name || '',
      surname: profile.surname || '',
      email: user?.email || '',
    });
    setStatus(initialStatus);
  };

  const handleSave = async () => {
    if (!personalForm.name.trim() || !personalForm.surname.trim()) {
      setStatus({ loading: false, success: null, error: 'Name and surname are required.' });
      return;
    }

    setStatus({ loading: true, success: null, error: null });

    try {
      if (!user?.id) throw new Error('User not authenticated');
      await updateProfileMutation({ id: user.id, updates: {
        name: personalForm.name.trim(),
        surname: personalForm.surname.trim(),
        address: addressPayload,
      }}).unwrap();
      setStatus({ loading: false, success: 'Profile updated successfully.', error: null });
    } catch (updateError: any) {
      setStatus({
        loading: false,
        success: null,
        error: updateError?.message || 'Unable to update profile right now.',
      });
    }
  };

  return (
    <NavigationGuard requireAuth>
      <div className="space-y-6 pb-16">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                Update your public profile details. These help us personalize your audio
                itineraries.
              </CardDescription>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
                <HiOutlineChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4">
              <Input
                label="Name"
                value={personalForm.name}
                onChange={(event) =>
                  setPersonalForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Your name"
                disabled={isLoading}
              />
              <Input
                label="Surname"
                value={personalForm.surname}
                onChange={(event) =>
                  setPersonalForm((prev) => ({ ...prev, surname: event.target.value }))
                }
                placeholder="Your surname"
                disabled={isLoading}
              />
              <Input
                label="Email"
                value={personalForm.email}
                disabled
                helperText="Email comes from Supabase Auth."
              />
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Address</h3>
              <Input
                label="Street"
                value={addressForm.street}
                onChange={(event) => handleAddressChange('street', event.target.value)}
                placeholder="Via, street number"
                disabled={isLoading}
              />
              <Input
                label="Address line 2"
                value={addressForm.line2 || ''}
                onChange={(event) => handleAddressChange('line2', event.target.value)}
                placeholder="Apartment, suite, etc."
                disabled={isLoading}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={addressForm.city}
                  onChange={(event) => handleAddressChange('city', event.target.value)}
                  disabled={isLoading}
                />
                <Input
                  label="Province"
                  value={addressForm.province}
                  onChange={(event) => handleAddressChange('province', event.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal code"
                  value={addressForm.postalCode}
                  onChange={(event) => handleAddressChange('postalCode', event.target.value)}
                  disabled={isLoading}
                />
                <Input
                  label="Country"
                  value={addressForm.country}
                  onChange={(event) => handleAddressChange('country', event.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <StatusMessage status={{ loading: false, success: null, error }} />}
            <StatusMessage status={status} />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
              <Button onClick={handleSave} loading={status.loading || isLoading}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </NavigationGuard>
  );
}
