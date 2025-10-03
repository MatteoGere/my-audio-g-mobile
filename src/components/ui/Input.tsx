'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'ghost';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'filled',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}

        {/* Input wrapper con icone */}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</div>
          )}

          <input
            className={cn(
              // Base
              'w-full h-12 px-4 text-base text-foreground placeholder:text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background',
              'disabled:cursor-not-allowed disabled:opacity-50',

              // Variant default
              variant === 'default' &&
                cn(
                  'bg-surface border border-marble-200/30 rounded-xl',
                  'hover:border-marble-200/50',
                  'focus:border-primary',
                  'dark:border-marble-200/20',
                ),

              // Variant filled
              variant === 'filled' &&
                cn(
                  'bg-marble-100/30 border border-transparent rounded-xl',
                  'hover:bg-marble-100/50',
                  'focus:bg-surface focus:border-primary',
                  'dark:bg-marble-100/10 dark:hover:bg-marble-100/20',
                ),

              // Variant ghost
              variant === 'ghost' &&
                cn(
                  'bg-transparent border-b-2 border-marble-200/30 rounded-none',
                  'hover:border-marble-200/50',
                  'focus:border-primary',
                ),

              // Con icone
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',

              // Error state
              error && '!border-error focus:!ring-error/50',
              className,
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</div>
          )}
        </div>

        {/* Helper text o errore */}
        {(helperText || error) && (
          <p className={cn('mt-2 text-sm', error ? 'text-error' : 'text-muted')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
