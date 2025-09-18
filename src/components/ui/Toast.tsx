import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

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
      duration: toast.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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
  onClose
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
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    success: {
      container: 'bg-success/10 border-success/20',
      icon: 'text-success',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      container: 'bg-warning/10 border-warning/20',
      icon: 'text-warning',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    },
    error: {
      container: 'bg-error/10 border-error/20',
      icon: 'text-error',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    info: {
      container: 'bg-info/10 border-info/20',
      icon: 'text-info',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  const variantConfig = variants[variant];

  return (
    <div
      className={cn(
        'relative w-full pointer-events-auto overflow-hidden rounded-md border p-4 shadow-medium transition-all duration-300 ease-in-out',
        variantConfig.container,
        isVisible && !isLeaving 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className={cn('h-5 w-5', variantConfig.icon)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={variantConfig.iconPath}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          {title && (
            <div className="text-sm font-medium text-foreground">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm text-muted">
              {description}
            </div>
          )}
          
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
          <svg
            className="h-4 w-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
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
  }
};

export { ToastComponent as Toast };
export default ToastComponent;