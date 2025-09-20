'use client';

import { useServiceWorker, useInstallPrompt } from '../../hooks/useServiceWorker';

export function PWAProvider() {
  const { isSupported } = useServiceWorker();
  const { promptInstall } = useInstallPrompt();

  // This component doesn't render anything visible,
  // it just handles PWA initialization
  return null;
}
