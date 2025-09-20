'use client';

import { HiOutlineMapPin, HiOutlineXMark } from 'react-icons/hi2';
import { Button } from '../ui';

interface LocationPermissionPromptProps {
  onRequestPermission: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
  className?: string;
}

export function LocationPermissionPrompt({
  onRequestPermission,
  onDismiss,
  isLoading = false,
  className = '',
}: LocationPermissionPromptProps) {
  return (
    <div
      className={`bg-sea-50 dark:bg-sea-200/10 border border-sea-200 dark:border-sea-200/20 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <HiOutlineMapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Discover Nearby Tours</h3>
            <p className="text-sm text-stone-600 dark:text-gray-400">
              Enable location access to find audio tours near you
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss"
        >
          <HiOutlineXMark className="h-4 w-4 text-stone-400 dark:text-gray-500" />
        </button>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onRequestPermission}
          loading={isLoading}
          className="flex-1"
        >
          Enable Location
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss} className="px-3">
          Not Now
        </Button>
      </div>
    </div>
  );
}
