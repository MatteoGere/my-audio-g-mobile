'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  variant?: 'default' | 'filled';
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Seleziona...',
  options,
  value,
  onChange,
  error,
  disabled,
  variant = 'default',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}

      {/* Select trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full h-12 px-4 text-left text-base',
          'flex items-center justify-between gap-2',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',

          // Variant default
          variant === 'default' &&
            cn(
              'bg-surface border border-marble-200/30 rounded-xl',
              'hover:border-marble-200/50',
              'dark:border-marble-200/20',
            ),

          // Variant filled
          variant === 'filled' &&
            cn(
              'bg-marble-100/30 border border-transparent rounded-xl',
              'hover:bg-marble-100/50',
              'dark:bg-marble-100/10',
            ),

          error && '!border-error',
          className,
        )}
        disabled={disabled}
      >
        <span className={cn(value ? 'text-foreground' : 'text-muted')}>
          {selectedOption?.label || placeholder}
        </span>

        {/* Chevron icon */}
        <svg
          className={cn(
            'w-4 h-4 text-muted transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-surface/95 backdrop-blur-xl rounded-xl border border-marble-200/20',
            'shadow-strong max-h-60 overflow-auto',
            'animate-slide-up-fade',
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={cn(
                'w-full px-4 py-3 text-left text-base',
                'flex items-center gap-3',
                'transition-colors duration-150',
                'first:rounded-t-xl last:rounded-b-xl',
                option.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : cn(
                      'hover:bg-marble-100/50 dark:hover:bg-marble-100/10',
                      'active:bg-marble-100/80 dark:active:bg-marble-100/20',
                    ),
                option.value === value && 'bg-primary/10 text-primary font-medium',
              )}
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
};

export default Select;
