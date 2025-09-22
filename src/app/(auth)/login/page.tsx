'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { useSignInMutation } from '@/lib/redux/api/apiSlice';

export default function LoginPage() {
  const router = useRouter();
  const [signIn, { isLoading, error }] = useSignInMutation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    try {
      await signIn({ email, password }).unwrap();
      router.push('/'); // Redirect to home after successful login
    } catch (err: any) {
      setLocalError(err?.message || 'Login failed. Please try again.');
    }
  };

  const displayError = localError || (error as any)?.message || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Welcome Back
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
          Sign in to continue your audio journey
        </p>
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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>

        {displayError && (
          <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
            <p className="text-sm text-error-700 dark:text-error-300">
              {displayError}
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
        >
          Sign In
        </Button>
      </form>

      {/* Forgot Password */}
      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>

      {/* Guest Mode */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-300 dark:border-stone-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400">
            Or
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => router.push('/')}
      >
        Continue as Guest
      </Button>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}