'use client';

import { useState, useEffect } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
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
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-4 shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center">
              <HiCheck className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1 h-7 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
          </div>
          <p className="text-sm text-muted">
            We've sent a password reset link to{' '}
            <span className="text-primary font-semibold">{email}</span>
          </p>
        </div>

        {/* Instructions */}
        <Card
          padding="md"
          className="rounded-xl bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/20 shadow-soft"
        >
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              What's next?
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-2 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Click the reset link in the email</span>
              </li>
              <li className="flex items-start gap-2 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Follow the instructions to create a new password</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-soft"
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
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
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
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
        </div>
        <p className="text-sm text-muted">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
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
          disabled={isLoading}
        >
          Send Reset Link
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
