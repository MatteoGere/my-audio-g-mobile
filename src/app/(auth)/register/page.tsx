'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Checkbox } from '@/components/ui';
import { useSignUpMutation } from '@/lib/redux/api/apiSlice';

export default function RegisterPage() {
  const router = useRouter();
  const [signUp, { isLoading, error }] = useSignUpMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (!acceptTerms) {
      setLocalError('Please accept the Terms and Conditions');
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
      }).unwrap();

      // Success - redirect to verification page or login
      router.push('/login?message=Please check your email to verify your account');
    } catch (err: any) {
      setLocalError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const displayError = localError || (error as any)?.message || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Create Account</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
          Join MyAudioG and discover amazing audio experiences
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            label="First Name"
            placeholder="John"
            value={formData.name}
            onChange={handleChange('name')}
            required
            autoComplete="given-name"
          />

          <Input
            type="text"
            label="Last Name"
            placeholder="Doe"
            value={formData.surname}
            onChange={handleChange('surname')}
            required
            autoComplete="family-name"
          />
        </div>

        <Input
          type="email"
          label="Email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange('email')}
          required
          autoComplete="email"
        />

        <div className="space-y-1">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange('password')}
            required
            autoComplete="new-password"
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">Minimum 6 characters</p>
        </div>

        <div className="space-y-1">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {showPassword ? 'Hide passwords' : 'Show passwords'}
          </button>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            id="accept-terms"
          />
          <label
            htmlFor="accept-terms"
            className="text-sm text-stone-600 dark:text-stone-400 leading-5"
          >
            I agree to the{' '}
            <Link
              href="/terms"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        {displayError && (
          <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
            <p className="text-sm text-error-700 dark:text-error-300">{displayError}</p>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
          Create Account
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
