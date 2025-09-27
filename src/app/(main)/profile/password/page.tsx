 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Button,
  Input,
} from '@/components/ui';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { useAuth } from '@/lib/hooks';
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

export default function PasswordPage() {
  const router = useRouter();
  const { changePassword } = useAuth();

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState<AsyncStatus>(initialStatus);

  const handleUpdatePassword = async () => {
    if (!form.current || !form.next || !form.confirm) {
      setStatus({ loading: false, success: null, error: 'All password fields are required.' });
      return;
    }

    if (form.next.length < 8) {
      setStatus({
        loading: false,
        success: null,
        error: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (form.next !== form.confirm) {
      setStatus({ loading: false, success: null, error: 'Passwords do not match.' });
      return;
    }

    setStatus({ loading: true, success: null, error: null });

    const result = await changePassword(form.current, form.next);
    if (result.success) {
      setStatus({ loading: false, success: 'Password updated successfully.', error: null });
      setForm({ current: '', next: '', confirm: '' });
    } else {
      setStatus({
        loading: false,
        success: null,
        error: result.error || 'Unable to update password right now.',
      });
    }
  };

  return (
    <NavigationGuard requireAuth>
      <div className="space-y-6 pb-16">
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Password & security</CardTitle>
                <CardDescription>
                  Keep your account secure by using a strong password you do not reuse elsewhere.
                </CardDescription>
              </div>
              <div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
                  <HiOutlineChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              </div>
            </div>

          <div className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={form.current}
              onChange={(event) => setForm((prev) => ({ ...prev, current: event.target.value }))}
              placeholder="Enter current password"
            />
            <Input
              label="New password"
              type="password"
              value={form.next}
              onChange={(event) => setForm((prev) => ({ ...prev, next: event.target.value }))}
              placeholder="Choose a new password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={form.confirm}
              onChange={(event) => setForm((prev) => ({ ...prev, confirm: event.target.value }))}
              placeholder="Repeat the new password"
            />

            <StatusMessage status={status} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleUpdatePassword} loading={status.loading}>
                Update password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </NavigationGuard>
  );
}
