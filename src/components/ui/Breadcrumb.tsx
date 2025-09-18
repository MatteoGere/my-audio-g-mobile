import React from 'react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  maxItems,
  className
}) => {
  const defaultSeparator = (
    <svg
      className="h-4 w-4 text-muted"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  // Handle maxItems by showing first item, ellipsis, and last few items
  const processedItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    if (maxItems <= 3) {
      return items.slice(-maxItems);
    }

    const ellipsisItem: BreadcrumbItem = {
      label: '...',
      disabled: true
    };

    return [
      items[0],
      ellipsisItem,
      ...items.slice(-(maxItems - 2))
    ];
  }, [items, maxItems]);

  return (
    <nav
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {/* Breadcrumb item */}
              {item.href ? (
                <a
                  href={item.href}
                  className={cn(
                    'hover:text-foreground transition-colors',
                    item.disabled || item.current
                      ? 'text-foreground font-medium cursor-default'
                      : 'text-muted hover:text-foreground'
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                  onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                >
                  {item.label}
                </a>
              ) : item.onClick && !item.disabled ? (
                <button
                  onClick={item.onClick}
                  className={cn(
                    'hover:text-foreground transition-colors text-left',
                    item.current
                      ? 'text-foreground font-medium cursor-default'
                      : 'text-muted hover:text-foreground'
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={cn(
                    isEllipsis
                      ? 'text-muted'
                      : item.current || isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted'
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {/* Separator */}
              {!isLast && (
                <span className="mx-1 flex items-center">
                  {separator || defaultSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;