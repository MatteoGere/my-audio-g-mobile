import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Types for API errors
export interface ApiError {
  status: number | string;
  message: string;
  details?: any;
}

// Type guards for RTK Query errors
export const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error != null && 'status' in error;
};

export const isSerializedError = (error: unknown): error is SerializedError => {
  return typeof error === 'object' && error != null && 'name' in error;
};

// Error parsing utilities
export const parseApiError = (error: unknown): ApiError => {
  if (isFetchBaseQueryError(error)) {
    // RTK Query fetch error
    if (error.status === 'FETCH_ERROR') {
      return {
        status: 'FETCH_ERROR',
        message: 'Network error occurred. Please check your connection.',
        details: error,
      };
    }
    
    if (error.status === 'PARSING_ERROR') {
      return {
        status: 'PARSING_ERROR',
        message: 'Failed to parse server response.',
        details: error,
      };
    }

    if (typeof error.status === 'number') {
      // HTTP error codes
      switch (error.status) {
        case 400:
          return {
            status: 400,
            message: 'Bad request. Please check your input.',
            details: error.data,
          };
        case 401:
          return {
            status: 401,
            message: 'Unauthorized. Please sign in again.',
            details: error.data,
          };
        case 403:
          return {
            status: 403,
            message: 'Access denied. You do not have permission.',
            details: error.data,
          };
        case 404:
          return {
            status: 404,
            message: 'Resource not found.',
            details: error.data,
          };
        case 409:
          return {
            status: 409,
            message: 'Conflict. Resource already exists.',
            details: error.data,
          };
        case 422:
          return {
            status: 422,
            message: 'Validation error. Please check your input.',
            details: error.data,
          };
        case 429:
          return {
            status: 429,
            message: 'Too many requests. Please try again later.',
            details: error.data,
          };
        case 500:
          return {
            status: 500,
            message: 'Server error. Please try again later.',
            details: error.data,
          };
        case 503:
          return {
            status: 503,
            message: 'Service unavailable. Please try again later.',
            details: error.data,
          };
        default:
          return {
            status: error.status,
            message: `Request failed with status ${error.status}.`,
            details: error.data,
          };
      }
    }
  }

  if (isSerializedError(error)) {
    // Redux serialized error
    return {
      status: 'SERIALIZED_ERROR',
      message: error.message || 'An unexpected error occurred.',
      details: error,
    };
  }

  // Supabase or custom errors
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    
    // Supabase error format
    if (errorObj.message) {
      return {
        status: errorObj.code || errorObj.status || 'UNKNOWN',
        message: errorObj.message,
        details: errorObj,
      };
    }

    // Generic error object
    if (errorObj.error) {
      return {
        status: 'CUSTOM_ERROR',
        message: typeof errorObj.error === 'string' ? errorObj.error : 'An error occurred.',
        details: errorObj,
      };
    }
  }

  // String error
  if (typeof error === 'string') {
    return {
      status: 'STRING_ERROR',
      message: error,
      details: null,
    };
  }

  // Unknown error type
  return {
    status: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    details: error,
  };
};

// User-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  const parsedError = parseApiError(error);
  return parsedError.message;
};

// Check if error is retryable
export const isRetryableError = (error: unknown): boolean => {
  const parsedError = parseApiError(error);
  
  // Network errors are retryable
  if (parsedError.status === 'FETCH_ERROR') {
    return true;
  }
  
  // Server errors are retryable
  if (typeof parsedError.status === 'number') {
    // Rate limiting is retryable after some time
    if (parsedError.status === 429) {
      return true;
    }
    
    return parsedError.status >= 500 && parsedError.status < 600;
  }
  
  return false;
};

// Retry delays (exponential backoff)
export const getRetryDelay = (attemptNumber: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
  
  // Add some jitter to avoid thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
};

// Error logging utility
export const logError = (error: unknown, context?: string) => {
  const parsedError = parseApiError(error);
  const logData = {
    context: context || 'Unknown',
    status: parsedError.status,
    message: parsedError.message,
    details: parsedError.details,
    timestamp: new Date().toISOString(),
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', logData);
  }
  
  // In production, you might want to send this to a logging service
  // sendToLoggingService(logData);
};

// Validation error helpers
export const getValidationErrors = (error: unknown): Record<string, string[]> | null => {
  const parsedError = parseApiError(error);
  
  if (parsedError.status === 422 && parsedError.details) {
    // Common validation error formats
    if (parsedError.details.errors) {
      return parsedError.details.errors;
    }
    
    if (parsedError.details.fieldErrors) {
      return parsedError.details.fieldErrors;
    }
    
    if (parsedError.details.validationErrors) {
      return parsedError.details.validationErrors;
    }
  }
  
  return null;
};

// Format validation errors for display
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  const messages: string[] = [];
  
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    fieldErrors.forEach((error) => {
      messages.push(`${field}: ${error}`);
    });
  });
  
  return messages.join(', ');
};

// Authentication error helpers
export const isAuthError = (error: unknown): boolean => {
  const parsedError = parseApiError(error);
  return parsedError.status === 401 || parsedError.status === 403;
};

// Network error helpers
export const isNetworkError = (error: unknown): boolean => {
  const parsedError = parseApiError(error);
  return parsedError.status === 'FETCH_ERROR';
};

// Timeout error helpers
export const isTimeoutError = (error: unknown): boolean => {
  const parsedError = parseApiError(error);
  return parsedError.message.toLowerCase().includes('timeout');
};