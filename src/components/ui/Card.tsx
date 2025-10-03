'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  position?: 'top' | 'bottom';
}

const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  padding = 'md',
  children,
  onClick,
  ...props
}) => {
  const variants = {
    default: cn('bg-surface rounded-2xl', 'border border-marble-200/10', 'shadow-soft'),

    glass: cn(
      'bg-surface/80 backdrop-blur-xl rounded-2xl',
      'border border-marble-200/10',
      'shadow-medium',
    ),

    elevated: cn('bg-surface rounded-2xl', 'shadow-strong', 'border border-marble-200/5'),

    outline: cn(
      'bg-transparent rounded-2xl',
      'border-2 border-marble-200/30',
      'dark:border-marble-200/20',
    ),

    interactive: cn(
      'bg-surface rounded-2xl',
      'border border-marble-200/10',
      'shadow-soft',
      'transition-all duration-200',
      'hover:shadow-medium hover:scale-[1.01]',
      'active:scale-[0.99]',
      'cursor-pointer',
    ),
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(variants[variant], paddings[padding], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  );
};

const CardImage: React.FC<CardImageProps> = ({ className, position = 'top', alt, ...props }) => {
  const positionStyles = {
    top: 'rounded-t-xl',
    bottom: 'rounded-b-xl',
  };

  return (
    <img
      className={cn('w-full h-auto object-cover', positionStyles[position], className)}
      alt={alt}
      {...props}
    />
  );
};

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn('text-base font-bold leading-tight tracking-tight text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-xs text-muted', className)} {...props}>
      {children}
    </p>
  );
};

export { Card, CardHeader, CardBody, CardFooter, CardImage, CardTitle, CardDescription };
export default Card;
