'use client';

import { useState, useEffect } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Checkbox, Textarea, Card } from '@/components/ui';
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
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-4 shadow-soft">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center">
              <HiCheck className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1 h-7 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Account Created!</h2>
          </div>
          <p className="text-sm text-muted">
            We've sent a verification email to{' '}
            <span className="text-primary font-semibold">{formData.email}</span>
          </p>
        </div>

        {/* Instructions */}
        <Card
          padding="md"
          className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 shadow-soft"
        >
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              What's next?
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-2 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start gap-2 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Sign in to start exploring audio guides</span>
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
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
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
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
        </div>
        <p className="text-sm text-muted">Join MyAudioG and discover amazing audio experiences</p>
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

        <div className="space-y-1.5">
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
          <p className="text-xs text-muted leading-relaxed">
            Must contain uppercase, lowercase, and numbers (minimum 6 characters)
          </p>
        </div>

        <div className="space-y-1.5">
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
            className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {showPassword ? 'Hide passwords' : 'Show passwords'}
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              id="accept-terms"
            />
            <label htmlFor="accept-terms" className="text-sm text-muted leading-5">
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {validationErrors.terms && (
            <div className="ml-6 p-2 rounded-lg bg-error/10">
              <p className="text-sm text-error font-medium">{validationErrors.terms}</p>
            </div>
          )}
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
          disabled={isLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
