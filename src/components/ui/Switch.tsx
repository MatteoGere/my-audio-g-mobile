import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent';
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className, 
    label, 
    description, 
    disabled, 
    size = 'md',
    variant = 'default',
    checked,
    ...props 
  }, ref) => {
    const sizes = {
      sm: {
        track: 'h-4 w-7',
        thumb: 'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0'
      },
      md: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      },
      lg: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      }
    };

    const variants = {
      default: {
        track: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-stone-200',
        thumb: 'bg-surface'
      },
      accent: {
        track: 'data-[state=checked]:bg-accent data-[state=unchecked]:bg-stone-200',
        thumb: 'bg-surface'
      }
    };

    const trackStyles = cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      sizes[size].track,
      variants[variant].track,
      className
    );

    const thumbStyles = cn(
      'pointer-events-none block rounded-full shadow-lg ring-0 transition-transform',
      sizes[size].thumb,
      variants[variant].thumb
    );

    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            disabled={disabled}
            checked={checked}
            ref={ref}
            {...props}
          />
          <div
            className={trackStyles}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => !disabled && props.onChange?.({
              target: { checked: !checked }
            } as React.ChangeEvent<HTMLInputElement>)}
          >
            <div
              className={thumbStyles}
              data-state={checked ? "checked" : "unchecked"}
            />
          </div>
        </div>
        
        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  disabled ? 'cursor-not-allowed opacity-50' : 'text-foreground'
                )}
                onClick={() => !disabled && props.onChange?.({
                  target: { checked: !checked }
                } as React.ChangeEvent<HTMLInputElement>)}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-xs text-muted',
                disabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;