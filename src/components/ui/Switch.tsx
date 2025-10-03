'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, disabled, size = 'md', checked, onChange, ...props }, ref) => {
    const handleToggle = () => {
      if (!disabled && onChange) {
        onChange({
          target: { checked: !checked },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <label
        className={cn(
          'inline-flex items-center justify-between gap-4 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Label section */}
        {(label || description) && (
          <div className="flex-1">
            {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
            {description && <span className="block text-sm text-muted mt-0.5">{description}</span>}
          </div>
        )}

        {/* Hidden input */}
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />

        {/* Visual switch */}
        <div
          className={cn(
            'relative shrink-0 rounded-full transition-all duration-200',

            // Sizes
            size === 'sm' && 'w-8 h-5',
            size === 'md' && 'w-11 h-6',
            size === 'lg' && 'w-14 h-7',

            // States
            'bg-marble-200/50',
            'peer-checked:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2',
            'dark:bg-marble-200/30',
            className,
          )}
          onClick={handleToggle}
        >
          {/* Thumb */}
          <div
            className={cn(
              'absolute top-1 rounded-full bg-white shadow-md transition-all duration-200',

              // Sizes e posizioni
              size === 'sm' && cn('w-3 h-3', checked ? 'left-[14px]' : 'left-1'),
              size === 'md' && cn('w-4 h-4', checked ? 'left-[20px]' : 'left-1'),
              size === 'lg' && cn('w-5 h-5', checked ? 'left-[28px]' : 'left-1'),
            )}
          />
        </div>
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
