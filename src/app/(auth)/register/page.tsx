'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Checkbox, Textarea } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isLoading, error, isAuthenticated, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    surname?: string;
    terms?: string;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  // Clear errors when form changes
  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData, acceptTerms, clearError]);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // Client-side validation
  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'First name is required';
    }

    if (!formData.surname.trim()) {
      errors.surname = 'Last name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      errors.terms = 'Please accept the Terms and Conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      surname: formData.surname,
    });

    if (result.success) {
      setIsSubmitted(true);
    }
    // Error handling is managed by the useAuth hook
  };

  // Success state UI
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-success-600 dark:text-success-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Account Created!
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            We've sent a verification email to <strong>{formData.email}</strong>
          </p>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-sea-50 dark:bg-sea-900/20 border border-sea-200 dark:border-sea-800">
          <div className="space-y-2 text-sm text-sea-700 dark:text-sea-300">
            <p>
              <strong>What's next?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Sign in to start exploring audio guides</li>
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
            Go to Sign In
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  name: '',
                  surname: '',
                  address: '',
                });
                setAcceptTerms(false);
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Register a different account
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
            error={validationErrors.name}
          />

          <Input
            type="text"
            label="Last Name"
            placeholder="Doe"
            value={formData.surname}
            onChange={handleChange('surname')}
            required
            autoComplete="family-name"
            error={validationErrors.surname}
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
          error={validationErrors.email}
        />

        <Textarea
          label="Address (Optional)"
          placeholder="Enter your address"
          value={formData.address}
          onChange={handleChange('address')}
          rows={2}
          className="resize-none"
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
            error={validationErrors.password}
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Must contain uppercase, lowercase, and numbers (minimum 6 characters)
          </p>
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
            error={validationErrors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {showPassword ? 'Hide passwords' : 'Show passwords'}
          </button>
        </div>

        <div className="space-y-2">
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
          {validationErrors.terms && (
            <p className="text-sm text-error-600 dark:text-error-400 ml-6">
              {validationErrors.terms}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
            <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
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
