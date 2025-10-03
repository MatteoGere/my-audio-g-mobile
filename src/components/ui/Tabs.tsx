'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}) => {
  return (
    <div className="w-full">
      <div
        className={cn(
          'flex gap-1',
          variant === 'default' && cn('p-1 bg-marble-100/30 rounded-xl', 'dark:bg-marble-100/20'),
          variant === 'pills' && 'gap-2',
          variant === 'underline' && 'border-b-2 border-marble-200/20 gap-0',
          fullWidth && 'w-full',
          className,
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = value === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                'flex items-center justify-center gap-2',
                'px-4 py-2.5 text-sm font-medium rounded-lg',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                fullWidth && 'flex-1',
                variant === 'default' &&
                  cn(
                    isActive
                      ? 'bg-surface shadow-sm text-foreground'
                      : 'text-muted hover:text-foreground',
                  ),
                variant === 'pills' &&
                  cn(
                    'rounded-full px-6',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-marble-100/30 text-muted hover:bg-marble-100/50 hover:text-foreground dark:bg-marble-100/20',
                  ),
                variant === 'underline' &&
                  cn(
                    'rounded-none border-b-2 pb-3',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-foreground hover:border-marble-200/50',
                  ),
              )}
              role="tab"
              aria-selected={isActive}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                    isActive
                      ? variant === 'pills'
                        ? 'bg-primary-foreground/20'
                        : 'bg-primary/10 text-primary'
                      : 'bg-marble-100/50 text-muted dark:bg-marble-100/30',
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
