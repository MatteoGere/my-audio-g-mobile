'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
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
  ...props
}) => {
  // Regole: rounded-xl, p-4 default, shadow-md, border, max-w-full, accessibilità
  const baseStyles = 'bg-surface rounded-xl transition-all duration-200 shadow-md max-w-full';

  const variants = {
    default: '',
    elevated: 'shadow-lg hover:shadow-xl',
    // Use semantic border color that adapts via CSS variables
    outlined: 'border border-muted',
  };

  // p-4 default, gap tra card gestito dal container
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], paddings[padding], className)}
      tabIndex={0}
      role="region"
      aria-label="Card"
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
    <h3 className={cn('text-base font-bold leading-tight tracking-tight text-foreground', className)} {...props}>
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
