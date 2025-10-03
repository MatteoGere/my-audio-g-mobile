'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  rounded?: 'default' | 'full' | 'square';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      rounded = 'default',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // Base styles (comune a tutte le variant)
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 font-medium',
      'transition-all duration-200 ease-out',
      'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    );

    // Variant styles
    const variants = {
      primary: cn(
        'bg-primary text-primary-foreground',
        'shadow-lg shadow-primary/25',
        'hover:shadow-xl hover:shadow-primary/30',
        'active:shadow-md',
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground',
        'shadow-md shadow-secondary/20',
        'hover:shadow-lg hover:shadow-secondary/25',
      ),
      accent: cn(
        'bg-accent text-accent-foreground',
        'shadow-md shadow-accent/20',
        'hover:shadow-lg hover:shadow-accent/25',
      ),
      ghost: cn(
        'bg-transparent text-foreground',
        'hover:bg-marble-100/50 dark:hover:bg-marble-100/10',
        'active:bg-marble-200/50 dark:active:bg-marble-200/20',
      ),
      outline: cn(
        'bg-transparent border-2 border-marble-200/30 text-foreground',
        'hover:bg-marble-100/30 hover:border-marble-200/50',
        'dark:border-marble-200/20 dark:hover:bg-marble-100/10',
      ),
      danger: cn(
        'bg-error text-white',
        'shadow-md shadow-error/20',
        'hover:shadow-lg hover:shadow-error/30',
      ),
    };

    // Size styles
    const sizes = {
      sm: 'h-9 px-4 text-sm rounded-lg',
      md: 'h-11 px-6 text-base rounded-xl',
      lg: 'h-14 px-8 text-lg rounded-2xl',
      icon: 'h-11 w-11 p-0',
    };

    // Rounded variants
    const roundedStyles = {
      default: '', // già coperto dai size
      full: '!rounded-full',
      square: '!rounded-lg',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          roundedStyles[rounded],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
