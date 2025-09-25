'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineChevronRight } from 'react-icons/hi2';

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

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator, maxItems, className }) => {
  const defaultSeparator = (
    <HiOutlineChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
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
      disabled: true,
    };

    return [items[0], ellipsisItem, ...items.slice(-(maxItems - 2))];
  }, [items, maxItems]);

  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center min-w-[44px] min-h-[44px]"
            >
              {/* Breadcrumb item */}
              {item.href ? (
                <a
                  href={item.href}
                  className={cn(
                    'hover:text-foreground transition-colors px-2 py-1 rounded-md min-w-[44px] min-h-[44px] flex items-center',
                    item.disabled || item.current
                      ? 'text-foreground font-bold cursor-default'
                      : 'text-muted hover:text-foreground',
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                  onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                  tabIndex={item.disabled ? -1 : 0}
                >
                  {item.label}
                </a>
              ) : item.onClick && !item.disabled ? (
                <button
                  onClick={item.onClick}
                  className={cn(
                    'hover:text-foreground transition-colors text-left px-2 py-1 rounded-md min-w-[44px] min-h-[44px] flex items-center',
                    item.current
                      ? 'text-foreground font-bold cursor-default'
                      : 'text-muted hover:text-foreground',
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                  tabIndex={item.disabled ? -1 : 0}
                  disabled={item.disabled}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={cn(
                    'px-2 py-1 rounded-md min-w-[44px] min-h-[44px] flex items-center',
                    isEllipsis
                      ? 'text-muted'
                      : item.current || isLast
                        ? 'text-foreground font-bold'
                        : 'text-muted',
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {/* Separator */}
              {!isLast && (
                <span className="mx-1 flex items-center">{separator || defaultSeparator}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
