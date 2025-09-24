import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export error handling utilities
export * from './utils/errorHandling';

// Re-export loading state utilities
export * from './utils/loadingStates';
