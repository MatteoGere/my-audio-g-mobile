'use client';

import React, { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signUp, signInWithProvider, clearError } from '@/store/slices/authSlice';

export default function SignupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = () => {
    const errors = {
      name: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = t('auth.signup.error.name_required');
      isValid = false;
    }

    if (!formData.surname.trim()) {
      errors.surname = t('auth.signup.error.surname_required');
      isValid = false;
    }

    if (!formData.email) {
      errors.email = t('auth.signup.error.email_required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('auth.signup.error.email_invalid');
      isValid = false;
    }

    if (!formData.password) {
      errors.password = t('auth.signup.error.password_required');
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = t('auth.signup.error.password_length');
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.signup.error.confirm_required');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.signup.error.password_match');
      isValid = false;
    }

    if (!acceptedTerms) {
      // This will be handled separately in the submit function
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      alert(t('auth.signup.error.terms'));
      return;
    }
    
    if (!validateForm()) return;

    try {
      const result = await dispatch(signUp({
        email: formData.email,
        password: formData.password,
        userData: {
          name: formData.name,
          surname: formData.surname,
        },
      })).unwrap();

      // Success - redirect to verification or onboarding
      router.push('/onboarding');
    } catch (error) {
      // Error is handled by the store
      console.error('Signup failed:', error);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    try {
      await dispatch(signInWithProvider(provider)).unwrap();
      // Redirect will be handled by the OAuth flow
    } catch (error) {
      console.error(`${provider} signup failed:`, error);
    }
  };

  return (
    <AuthLayout
      title={t('auth.signup.title')}
      subtitle={t('auth.signup.subtitle')}
      className="justify-center max-w-sm mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Global Error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="name"
            type="text"
            label={t('auth.signup.name_label')}
            placeholder={t('auth.signup.name_placeholder')}
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            variant={formErrors.name ? 'error' : 'default'}
            autoComplete="given-name"
            disabled={isLoading}
          />
          <Input
            name="surname"
            type="text"
            label={t('auth.signup.surname_label')}
            placeholder={t('auth.signup.surname_placeholder')}
            value={formData.surname}
            onChange={handleInputChange}
            error={formErrors.surname}
            variant={formErrors.surname ? 'error' : 'default'}
            autoComplete="family-name"
            disabled={isLoading}
          />
        </div>

        {/* Email Field */}
        <Input
          name="email"
          type="email"
          label={t('auth.signup.email_label')}
          placeholder={t('auth.signup.email_placeholder')}
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          variant={formErrors.email ? 'error' : 'default'}
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password Fields */}
        <Input
          name="password"
          type="password"
          label={t('auth.signup.password_label')}
          placeholder={t('auth.signup.password_placeholder')}
          value={formData.password}
          onChange={handleInputChange}
          error={formErrors.password}
          variant={formErrors.password ? 'error' : 'default'}
          autoComplete="new-password"
          disabled={isLoading}
          helperText={t('auth.signup.password_helper')}
        />

        <Input
          name="confirmPassword"
          type="password"
          label={t('auth.signup.confirm_label')}
          placeholder={t('auth.signup.confirm_placeholder')}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={formErrors.confirmPassword}
          variant={formErrors.confirmPassword ? 'error' : 'default'}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Terms and Privacy */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-2"
            disabled={isLoading}
          />
          <label htmlFor="terms" className="text-sm text-foreground leading-5">
            {t('auth.signup.terms_prefix')}{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
              {t('auth.signup.terms')}
            </Link>{' '}
            {t('auth.signup.terms_and')}{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
              {t('auth.signup.privacy')}
            </Link>
          </label>
        </div>

        {/* Sign Up Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? t('auth.signup.loading') : t('auth.signup.button')}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted">{t('auth.signup.or_signup_with')}</span>
          </div>
        </div>

        {/* Social Signup Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleSocialSignup('google')}
            disabled={isLoading}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.signup.google')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleSocialSignup('apple')}
            disabled={isLoading}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            {t('auth.signup.apple')}
          </Button>
        </div>

        {/* Sign In Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted">
            {t('auth.signup.have_account')}{' '}
            <Link 
              href="/auth/login" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t('auth.signup.login_link')}
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}