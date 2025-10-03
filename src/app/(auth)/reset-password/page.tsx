'use client';

import { useState, useEffect, Suspense } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';

export const dynamic = 'force-dynamic';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const token = searchParams.get('token');

  // Clear errors when inputs change
  useEffect(() => {
    setError(null);
    setValidationErrors({});
  }, [newPassword, confirmPassword]);

  // Validate the token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const validateForm = () => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await resetPassword(token, newPassword);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || 'Failed to reset password. Please try again.');
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-4 shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center">
              <HiCheck className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1 h-7 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Password Reset Successful</h2>
          </div>
          <p className="text-sm text-muted">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        {/* Action */}
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-soft"
          onClick={() => router.push('/login')}
        >
          Continue to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="text-2xl font-bold text-foreground">Reset Your Password</h2>
        </div>
        <p className="text-sm text-muted">Choose a strong new password for your account</p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            error={validationErrors.newPassword}
          />
          <div className="text-xs text-muted leading-relaxed">
            Must contain at least 6 characters with uppercase, lowercase, and numbers
          </div>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          error={validationErrors.confirmPassword}
        />

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="rounded text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="showPassword" className="text-sm text-muted cursor-pointer">
            Show passwords
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-error/10 to-error/5 border border-error/30 shadow-soft">
            <p className="text-sm text-error font-medium">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-soft"
          loading={isLoading}
          disabled={isLoading || !token}
        >
          Reset Password
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1.5"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary/40 border-t-primary rounded-full"></div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
