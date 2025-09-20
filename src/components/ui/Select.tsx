import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineChevronDown, HiCheck } from 'react-icons/hi2';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  onValueChange?: (value: string | string[]) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder = 'Select an option...',
  label,
  error,
  helperText,
  disabled = false,
  multiple = false,
  onValueChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | string[]>(
    multiple ? [] : value || defaultValue || '',
  );

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      setSelectedValue(newValues);
      onValueChange?.(newValues);
    } else {
      setSelectedValue(optionValue);
      onValueChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(selectedValue)) {
      if (selectedValue.length === 0) return placeholder;
      if (selectedValue.length === 1) {
        const option = options.find((opt) => opt.value === selectedValue[0]);
        return option?.label || '';
      }
      return `${selectedValue.length} selected`;
    }

    const option = options.find((opt) => opt.value === selectedValue);
    return option?.label || placeholder;
  };

  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(selectedValue)) {
      return selectedValue.includes(optionValue);
    }
    return selectedValue === optionValue;
  };

  const buttonStyles = cn(
    'flex h-10 w-full items-center justify-between rounded-md border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    error ? 'border-error' : 'border-stone-200 hover:border-stone-300',
    isOpen && 'ring-2 ring-primary ring-offset-2',
    className,
  );

  return (
    <div className="relative w-full space-y-1">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <button
        type="button"
        onClick={handleToggle}
        className={buttonStyles}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            selectedValue && (Array.isArray(selectedValue) ? selectedValue.length > 0 : true)
              ? 'text-foreground'
              : 'text-muted',
          )}
        >
          {getDisplayValue()}
        </span>
        <HiOutlineChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-stone-200 bg-surface shadow-medium">
          <ul className="max-h-60 overflow-auto py-1" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => !option.disabled && handleOptionClick(option.value)}
                className={cn(
                  'relative cursor-pointer select-none py-2 px-3 text-sm transition-colors',
                  option.disabled && 'cursor-not-allowed opacity-50',
                  !option.disabled && 'hover:bg-stone-100',
                  isSelected(option.value) && 'bg-primary text-primary-foreground',
                )}
                role="option"
                aria-selected={isSelected(option.value)}
              >
                <span className="block truncate">{option.label}</span>
                {multiple && isSelected(option.value) && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <HiCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(error || helperText) && (
        <p className={cn('text-xs', error ? 'text-error' : 'text-muted')}>{error || helperText}</p>
      )}
    </div>
  );
};

export default Select;
