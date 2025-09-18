import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, disabled, indeterminate, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    const checkboxStyles = cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-stone-300 bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
      'checked:bg-primary checked:border-primary checked:text-primary-foreground',
      error && 'border-error',
      className,
    );

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className={checkboxStyles}
            disabled={disabled}
            ref={checkboxRef}
            {...props}
          />
          {/* Custom checkmark */}
          <svg
            className={cn(
              'absolute inset-0 h-4 w-4 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100',
              'pointer-events-none',
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>

          {/* Indeterminate state */}
          {indeterminate && (
            <svg
              className="absolute inset-0 h-4 w-4 text-primary-foreground opacity-100 pointer-events-none"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  disabled ? 'cursor-not-allowed opacity-50' : 'text-foreground',
                  error && 'text-error',
                )}
                onClick={() => !disabled && checkboxRef.current?.click()}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn('text-xs', error ? 'text-error' : 'text-muted')}>{description}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
