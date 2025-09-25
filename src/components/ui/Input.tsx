'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      icon,
      iconPosition = 'left',
      label,
      error,
      helperText,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Regole: rounded-lg, min-h-[44px], px-4 py-3, shadow-sm, border, focus ring, font-bold, text-base
    const baseStyles =
      'flex min-h-[44px] w-full rounded-lg border bg-surface px-4 py-3 text-base placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm';

    const variants = {
      default: 'border-muted hover:border-foreground/30 focus:border-primary',
      error: 'border-error text-error focus-visible:ring-error',
    };

    const inputStyles = cn(
      baseStyles,
      variants[error ? 'error' : variant],
      icon && iconPosition === 'left' && 'pl-10',
      icon && iconPosition === 'right' && 'pr-10',
      className,
    );

    return (
      <div className="w-full space-y-1">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative">
          {icon && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none',
                iconPosition === 'left' ? 'left-3' : 'right-3',
              )}
            >
              {icon}
            </div>
          )}
          <input className={inputStyles} disabled={disabled} ref={ref} {...props} />
        </div>
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-error' : 'text-muted')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
