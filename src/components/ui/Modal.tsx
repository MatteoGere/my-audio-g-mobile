'use client';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'center' | 'bottom' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export type DialogProps = ModalProps;

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  variant = 'bottom',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
      onClick={handleOverlayClick}
    >
      {/* Modal container */}
      <div
        className={cn(
          // Variant center
          variant === 'center' &&
            cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[calc(100%-2rem)] max-h-[90vh] overflow-auto',
              'animate-scale-up',
              size === 'sm' && 'max-w-sm',
              size === 'md' && 'max-w-md',
              size === 'lg' && 'max-w-2xl',
              size === 'full' && 'max-w-[95vw]',
            ),

          // Variant bottom
          variant === 'bottom' &&
            cn(
              'absolute bottom-0 left-0 right-0',
              'max-h-[90vh] overflow-auto',
              'rounded-t-3xl',
              'animate-slide-up',
            ),

          // Variant fullscreen
          variant === 'fullscreen' && cn('absolute inset-0', 'animate-fade-in'),

          // Common styles
          'bg-surface/95 backdrop-blur-xl',
          'shadow-strong',
          variant !== 'bottom' && 'rounded-2xl',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-marble-200/10">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'ml-4 p-2 rounded-full',
                  'hover:bg-marble-100/50 dark:hover:bg-marble-100/10',
                  'active:bg-marble-100/80 dark:active:bg-marble-100/20',
                  'transition-colors duration-200',
                )}
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Dialog = Modal; // Alias for Modal

export { Modal, Dialog };
export default Modal;
