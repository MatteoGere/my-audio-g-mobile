'use client';
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
    // Regole: min-w-[44px] min-h-[44px], rounded-lg/rounded-xl, shadow-md, padding px-4 py-3 (standard), gap-3+, font-bold, text-base+, focus ring, responsive spacing
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap min-w-[44px] min-h-[44px] rounded-xl font-bold text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-md',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/95 shadow-md',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/95 shadow-md',
      outline:
        'border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground active:bg-primary/95 shadow-md',
      ghost: 'text-foreground hover:bg-surface active:bg-surface/80',
    };

    // Regole: padding px-4 py-3 (standard), gap-3+, responsive
    const sizes = {
      sm: 'h-11 px-3 py-2 text-sm gap-2 rounded-lg', // min-h-[44px]
      md: 'h-12 px-4 py-3 text-base gap-3 rounded-xl', // min-h-[48px]
      lg: 'h-14 px-6 py-4 text-lg gap-4 rounded-xl', // min-h-[56px]
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
