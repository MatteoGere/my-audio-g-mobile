import React from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineArrowPath } from 'react-icons/hi2';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-soft',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/95 shadow-soft',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/95 shadow-soft',
      outline:
        'border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground active:bg-primary/95',
      ghost: 'text-foreground hover:bg-surface active:bg-surface/80',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          className,
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <HiOutlineArrowPath className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
