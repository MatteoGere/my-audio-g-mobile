'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

  const variants = {
    default: 'bg-marble-100 text-foreground dark:bg-marble-100/20',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    outline: 'bg-transparent border-2 border-marble-200/30 text-foreground',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'primary' && 'bg-primary',
            variant === 'secondary' && 'bg-secondary',
            variant === 'accent' && 'bg-accent',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'error' && 'bg-error',
            variant === 'default' && 'bg-foreground',
            variant === 'outline' && 'bg-foreground',
          )}
        />
      )}
      {children}
    </div>
  );
};

export default Badge;
