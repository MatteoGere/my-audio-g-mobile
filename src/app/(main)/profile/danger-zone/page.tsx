'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Modal,
} from '@/components/ui';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { useI18n } from '@/i18n/I18nProvider';
import { useAuth } from '@/lib/hooks';
import {
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

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

export default function DangerZonePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session, signOut } = useAuth();

  const [status, setStatus] = useState<AsyncStatus>(initialStatus);
  const [confirmationValue, setConfirmationValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationValue.toUpperCase() !== 'DELETE') {
      setStatus({
        loading: false,
        success: null,
        error: "Please type 'DELETE' to confirm.",
      });
      return;
    }

    if (!session?.access_token) {
      setStatus({
        loading: false,
        success: null,
        error: 'Session expired. Please sign in again.',
      });
      return;
    }

    setStatus({ loading: true, success: null, error: null });

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

      setStatus({ loading: false, success: 'Account deleted successfully.', error: null });
      setModalOpen(false);
      await signOut();
      router.push('/');
    } catch (deleteError: any) {
      setStatus({
        loading: false,
        success: null,
        error: deleteError?.message || 'Unable to delete account right now.',
      });
    }
  };

  return (
    <NavigationGuard requireAuth>
      <div className="space-y-6 pb-16">
        <div className="border border-error/30 bg-error/5 space-y-4 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-error">
                <HiOutlineTrash className="h-5 w-5" aria-hidden="true" />
                <CardTitle className="text-error">{t('dangerZone.title')}</CardTitle>
              </div>
              <CardDescription>{t('dangerZone.description')}</CardDescription>
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="text-error"
                onClick={() => router.push('/profile')}
              >
                <HiOutlineChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('dangerZone.back')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusMessage status={status} />
            <Button
              variant="ghost"
              className="text-error"
              onClick={() => {
                setModalOpen(true);
                setStatus(initialStatus);
                setConfirmationValue('');
              }}
            >
              Delete account
            </Button>
          </div>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
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
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
              disabled={status.loading}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={status.loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-error text-primary-foreground hover:bg-error/90"
                onClick={handleDeleteAccount}
                loading={status.loading}
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
