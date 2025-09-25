'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineUser } from 'react-icons/hi2';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  children?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt,
  fallback,
  size = 'md',
  status,
  showStatus = false,
  children,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Regole: rounded-full, min-w-[44px], min-h-[44px], font-bold, shadow-sm
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-11 w-11 min-w-[44px] min-h-[44px] text-base',
    lg: 'h-14 w-14 min-w-[56px] min-h-[56px] text-lg',
    xl: 'h-16 w-16 min-w-[64px] min-h-[64px] text-xl',
    '2xl': 'h-20 w-20 min-w-[80px] min-h-[80px] text-2xl',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-stone-400',
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

  const shouldShowImage = src && imageLoaded && !imageError;
  const shouldShowFallback = !shouldShowImage && (fallback || alt);

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

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-stone-100 font-bold text-stone-700 overflow-hidden shadow-sm',
          sizes[size],
          className,
        )}
        {...props}
      >
        {shouldShowImage && <img src={src} alt={alt} className="h-full w-full object-cover" />}

        {shouldShowFallback && (
          <span className="select-none">{getInitials(fallback || alt || '')}</span>
        )}

        {!shouldShowImage && !shouldShowFallback && children && (
          <span className="select-none">{children}</span>
        )}

        {!shouldShowImage && !shouldShowFallback && !children && (
          <HiOutlineUser className="h-1/2 w-1/2 text-stone-400" aria-hidden="true" />
        )}
      </div>

      {showStatus && status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface',
            statusSizes[size],
            statusColors[status],
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
