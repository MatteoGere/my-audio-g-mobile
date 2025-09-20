import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineXCircle, HiOutlineXMark } from 'react-icons/hi2';

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
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
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
      container: 'bg-surface border-stone-200',
      icon: 'text-info',
      IconComp: HiOutlineInformationCircle,
    },
    success: {
      container: 'bg-success/10 border-success/20',
      icon: 'text-success',
      IconComp: HiOutlineCheckCircle,
    },
    warning: {
      container: 'bg-warning/10 border-warning/20',
      icon: 'text-warning',
      IconComp: HiOutlineExclamationTriangle,
    },
    error: {
      container: 'bg-error/10 border-error/20',
      icon: 'text-error',
      IconComp: HiOutlineXCircle,
    },
    info: {
      container: 'bg-info/10 border-info/20',
      icon: 'text-info',
      IconComp: HiOutlineInformationCircle,
    },
  } as const;

  const variantConfig = variants[variant];
  const Icon = variantConfig.IconComp;

  return (
    <div
      className={cn(
        'relative w-full pointer-events-auto overflow-hidden rounded-md border p-4 shadow-medium transition-all duration-300 ease-in-out',
        variantConfig.container,
        isVisible && !isLeaving
          ? 'transform translate-x-0 opacity-100'
          : 'transform translate-x-full opacity-0',
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', variantConfig.icon)} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          {title && <div className="text-sm font-medium text-foreground">{title}</div>}
          {description && <div className="text-sm text-muted">{description}</div>}

          {/* Action */}
          {action && (
            <div className="mt-2">
              <button
                onClick={action.onClick}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-stone-100 transition-colors"
          aria-label="Close notification"
        >
          <HiOutlineXMark className="h-4 w-4 text-muted" aria-hidden="true" />
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
