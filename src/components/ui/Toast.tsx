'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import {
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineXMark,
} from 'react-icons/hi2';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface ToastProps extends Omit<Toast, 'id'> {
  isVisible?: boolean;
  onAnimationEnd?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[100] flex flex-col gap-2 pb-safe"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} />
      ))}
    </div>
  );
};

const ToastComponent: React.FC<Toast> = ({
  id,
  title,
  description,
  variant = 'default',
  action,
  onClose,
}) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    onClose?.();

    // Remove from context after animation
    setTimeout(() => {
      removeToast(id);
    }, 200);
  };

  const variants = {
    default: {
      container: 'bg-surface/95 backdrop-blur-xl border-marble-200/20',
      icon: 'text-foreground',
      IconComp: HiOutlineInformationCircle,
    },
    success: {
      container: 'bg-success/10 backdrop-blur-xl border-success/30',
      icon: 'text-success',
      IconComp: HiOutlineCheckCircle,
    },
    warning: {
      container: 'bg-warning/10 backdrop-blur-xl border-warning/30',
      icon: 'text-warning',
      IconComp: HiOutlineExclamationTriangle,
    },
    error: {
      container: 'bg-error/10 backdrop-blur-xl border-error/30',
      icon: 'text-error',
      IconComp: HiOutlineXCircle,
    },
    info: {
      container: 'bg-info/10 backdrop-blur-xl border-info/30',
      icon: 'text-info',
      IconComp: HiOutlineInformationCircle,
    },
  } as const;

  const variantConfig = variants[variant];
  const Icon = variantConfig.IconComp;

  return (
    <div
      className={cn(
        'relative w-full p-4 rounded-2xl border shadow-strong',
        'pointer-events-auto overflow-hidden',
        'transition-all duration-300 ease-out',
        variantConfig.container,
        isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
      role="alert"
    >
      <div className="flex gap-3 items-start">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn('w-5 h-5', variantConfig.icon)} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <div className="text-sm font-semibold text-foreground mb-1">{title}</div>}
          {description && <div className="text-sm text-muted">{description}</div>}

          {/* Action */}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-2 text-sm font-medium underline',
                'hover:opacity-80 transition-opacity',
                variant === 'default' && 'text-primary',
                variant !== 'default' && variantConfig.icon,
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 p-1 rounded-full',
            'hover:bg-marble-100/50 dark:hover:bg-marble-100/10',
            'transition-colors',
          )}
          aria-label="Close notification"
        >
          <HiOutlineXMark className="w-4 h-4 text-muted" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

// Hook for convenient toast usage
export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant'>>) => {
    // This would be used with ToastProvider context
    return { variant: 'success' as const, description: message, ...options };
  },
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant'>>) => {
    return { variant: 'error' as const, description: message, ...options };
  },
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant'>>) => {
    return { variant: 'warning' as const, description: message, ...options };
  },
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant'>>) => {
    return { variant: 'info' as const, description: message, ...options };
  },
  default: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant'>>) => {
    return { variant: 'default' as const, description: message, ...options };
  },
};

export { ToastComponent as Toast };
export default ToastComponent;
