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

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: boolean;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, disabled, ...props }, ref) => {
    const radioStyles = cn(
      'peer h-4 w-4 shrink-0 rounded-full border border-stone-300 bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
      'checked:bg-primary checked:border-primary',
      error && 'border-error',
      className,
    );

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input type="radio" className={radioStyles} disabled={disabled} ref={ref} {...props} />
          {/* Custom radio dot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
          </div>
        </div>

        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  disabled ? 'cursor-not-allowed opacity-50' : 'text-foreground',
                  error && 'text-error',
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn('text-xs', error ? 'text-error' : 'text-muted')}>{description}</p>
            )}
          </div>
        )}
      </div>
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

  const containerStyles = cn(
    'space-y-3',
    orientation === 'horizontal' && 'flex flex-wrap gap-6 space-y-0',
    className,
  );

  return (
    <div className={containerStyles} role="radiogroup">
      {options.map((option) => (
        <div key={option.value}>
          <Radio
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => !option.disabled && handleChange(option.value)}
            disabled={disabled || option.disabled}
            label={option.label}
            description={option.description}
            error={!!error}
          />
        </div>
      ))}
      {error && <p className="text-xs text-error mt-2">{error}</p>}
    </div>
  );
};

export { Radio, RadioGroup };
export default RadioGroup;
