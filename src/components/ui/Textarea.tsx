import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error';
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = 'default',
      label,
      error,
      helperText,
      disabled,
      resize = 'vertical',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'flex min-h-[80px] w-full rounded-md border bg-surface px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200';

    const variants = {
      default: 'border-stone-200 hover:border-stone-300 focus:border-primary',
      error: 'border-error text-error focus-visible:ring-error',
    };

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const textareaStyles = cn(
      baseStyles,
      variants[error ? 'error' : variant],
      resizeStyles[resize],
      className,
    );

    return (
      <div className="w-full space-y-1">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <textarea className={textareaStyles} disabled={disabled} ref={ref} {...props} />
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-error' : 'text-muted')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
