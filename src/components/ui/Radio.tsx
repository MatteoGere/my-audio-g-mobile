'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, size = 'md', disabled, checked, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex items-start gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          type="radio"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          ref={ref}
          {...props}
        />

        {/* Custom radio visual */}
        <div
          className={cn(
            'flex items-center justify-center shrink-0 rounded-full',
            'border-2 transition-all duration-200',

            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6',

            'border-marble-200/50 bg-transparent',
            'peer-checked:border-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2',
            'peer-hover:border-primary/50',
            className,
          )}
        >
          {/* Inner dot */}
          <div
            className={cn(
              'rounded-full bg-primary transition-all duration-200',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-2.5',
              checked ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
            )}
          />
        </div>

        {/* Label */}
        {(label || description) && (
          <div className="flex-1 pt-0.5">
            {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
            {description && <span className="block text-sm text-muted mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  error,
  className,
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (optionValue: string) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
  };

  return (
    <div
      className={cn(
        'flex gap-4',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
      role="radiogroup"
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={selectedValue === option.value}
          onChange={() => !option.disabled && handleChange(option.value)}
          disabled={disabled || option.disabled}
          label={option.label}
          description={option.description}
        />
      ))}
      {error && <p className="text-sm text-error mt-2">{error}</p>}
    </div>
  );
};

export { Radio, RadioGroup };
export default RadioGroup;
