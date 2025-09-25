'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading, error, isAuthenticated, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts or inputs change
  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [email, password, clearError]);

  // Client-side validation
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      router.push('/home');
    }
    // Error handling is managed by the useAuth hook
  };

  const displayError = error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-sm text-muted mt-2">Sign in to continue your audio journey</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={validationErrors.email}
        />

        <div className="space-y-1">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            error={validationErrors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-primary transition-colors"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>

        {displayError && (
          <div className="p-3 rounded-lg bg-surface border border-carbon-200">
            <p className="text-sm text-error-700">{displayError}</p>
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
          Sign In
        </Button>
      </form>

      {/* Forgot Password */}
      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-primary transition-colors">
          Forgot your password?
        </Link>
      </div>

      {/* Guest Mode */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-carbon-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-muted">Or</span>
        </div>
      </div>

      <Button variant="outline" size="lg" className="w-full" onClick={() => router.push('/')}>
        Continue as Guest
      </Button>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
