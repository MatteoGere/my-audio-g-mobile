'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, size = 'md', disabled, checked, onChange, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Checkbox input (hidden) */}
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />

        {/* Custom checkbox visual */}
        <div
          className={cn(
            'flex items-center justify-center shrink-0',
            'border-2 rounded-md transition-all duration-200',

            // Size variants
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6',

            // States
            'border-marble-200/50 bg-transparent',
            'peer-checked:bg-primary peer-checked:border-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2',
            'peer-hover:border-primary/50',
            'dark:border-marble-200/30',
            className,
          )}
        >
          {/* Checkmark icon */}
          <svg
            className={cn(
              'transition-all duration-200',
              size === 'sm' && 'w-2.5 h-2.5',
              size === 'md' && 'w-3 h-3',
              size === 'lg' && 'w-4 h-4',
              checked ? 'opacity-100 scale-100 text-primary-foreground' : 'opacity-0 scale-50',
            )}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Label e description */}
        {(label || description) && (
          <div className="flex-1 pt-0.5">
            {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
            {description && <span className="block text-sm text-muted mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
