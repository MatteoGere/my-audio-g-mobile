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
  const baseStyles = 'bg-surface rounded-lg transition-all duration-200';

  const variants = {
    default: 'border border-stone-200',
    elevated: 'shadow-soft hover:shadow-medium',
    outlined: 'border-2 border-stone-200 hover:border-stone-300',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={cn(baseStyles, variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex items-center pt-0', className)} {...props}>
      {children}
    </div>
  );
};

const CardImage: React.FC<CardImageProps> = ({ className, position = 'top', alt, ...props }) => {
  const positionStyles = {
    top: 'rounded-t-lg',
    bottom: 'rounded-b-lg',
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
      className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
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
    <p className={cn('text-sm text-muted', className)} {...props}>
      {children}
    </p>
  );
};

export { Card, CardHeader, CardBody, CardFooter, CardImage, CardTitle, CardDescription };
export default Card;
