'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
}

const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  className,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full" {...props}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          {label ? (
            <span className="text-sm font-medium text-foreground">{label}</span>
          ) : (
            <span className="text-sm font-medium text-foreground">Progress</span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-muted">{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}

      {/* Progress bar track */}
      <div
        className={cn(
          'w-full bg-marble-100/50 rounded-full overflow-hidden',
          'dark:bg-marble-100/20',

          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2.5',
          size === 'lg' && 'h-3.5',
          className,
        )}
      >
        {/* Progress bar fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',

            variant === 'default' && 'bg-primary',
            variant === 'primary' && 'bg-primary',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'error' && 'bg-error',

            animated &&
              'bg-gradient-to-r from-primary via-primary-foreground to-primary bg-[length:200%_100%] animate-shimmer',
          )}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = 'md',
  variant = 'primary',
  ...props
}) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-4',
  };

  const variants = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    accent: 'border-accent border-t-transparent',
    muted: 'border-muted border-t-transparent',
  };

  return (
    <div
      className={cn('rounded-full animate-spin', sizes[size], variants[variant], className)}
      {...props}
      role="status"
      aria-label="Loading"
    />
  );
};

export { Progress, Spinner };
export default Progress;
