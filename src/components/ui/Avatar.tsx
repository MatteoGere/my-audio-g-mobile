'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string; // initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  shape?: 'circle' | 'square';
  border?: boolean;
  children?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt,
  fallback,
  size = 'md',
  status,
  shape = 'circle',
  border = false,
  children,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusIndicatorSizes = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-4 h-4 border-2',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-marble-200 dark:bg-marble-200/50',
    away: 'bg-warning',
    busy: 'bg-error',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  React.useEffect(() => {
    if (src) {
      setImageLoaded(false);
      setImageError(false);

      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = src;
    }
  }, [src]);

  const shouldShowImage = src && imageLoaded && !imageError;
  const displayFallback = fallback || alt?.[0]?.toUpperCase() || '?';

  return (
    <div
      className={cn(
        'relative shrink-0 inline-flex items-center justify-center',
        'bg-marble-100 text-foreground font-semibold overflow-hidden',
        'dark:bg-marble-100/20',

        // Sizes
        sizes[size],

        // Shapes
        shape === 'circle' && 'rounded-full',
        shape === 'square' && 'rounded-lg',

        // Border
        border && 'ring-2 ring-marble-200/30 ring-offset-2 ring-offset-background',

        className,
      )}
      {...props}
    >
      {/* Image */}
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback initials or children
        children || <span>{displayFallback}</span>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            'border-background',
            statusIndicatorSizes[size],
            statusColors[status],
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;
