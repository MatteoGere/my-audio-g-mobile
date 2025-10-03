'use client';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      maxLength,
      showCount,
      autoResize,
      disabled,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize, value]);

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {maxLength && showCount && (
              <span className="ml-2 text-xs text-muted">
                {currentLength}/{maxLength}
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <textarea
            className={cn(
              // Base
              'w-full min-h-[80px] px-4 py-3 text-base text-foreground placeholder:text-muted',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'resize-y',

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

              // Error state
              error && '!border-error focus:!ring-error/50',

              // Auto resize
              autoResize && 'resize-none overflow-hidden',

              className,
            )}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            ref={(node) => {
              textareaRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            {...props}
          />

          {/* Character count */}
          {showCount && maxLength && !label && (
            <div className="absolute bottom-3 right-3 text-xs text-muted pointer-events-none">
              {currentLength}/{maxLength}
            </div>
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

Textarea.displayName = 'Textarea';

export default Textarea;
