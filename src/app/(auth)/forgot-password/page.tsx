'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Clear errors when email changes
  useEffect(() => {
    setError(null);
    setValidationError(null);
  }, [email]);

  const validateEmail = () => {
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await forgotPassword(email);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'Failed to send reset email. Please try again.');
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
          <p className="text-sm text-muted mt-2">We've sent a password reset link to <strong>{email}</strong></p>
        </div>

        {/* Instructions */}
  <div className="p-4 rounded-lg bg-surface border border-muted">
          <div className="space-y-2 text-sm text-muted">
            <p>
              <strong>What's next?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the reset link in the email</li>
              <li>Follow the instructions to create a new password</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Back to Sign In
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-sm text-primary hover:text-primary-700 transition-colors"
            >
              Try a different email address
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
        <p className="text-sm text-muted mt-2">No worries! Enter your email and we'll send you reset instructions.</p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={validationError || undefined}
        />

        {error && (
      <div className="p-3 rounded-lg bg-error/10 border border-error/30">
        <p className="text-sm text-error">{error}</p>
            </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Send Reset Link
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
              className="text-sm text-primary hover:text-primary-700 transition-colors"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}
