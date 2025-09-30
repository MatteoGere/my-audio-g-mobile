'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { usePWAInstallPrompt } from '@/lib/hooks';

export function InstallAppButton() {
  const { canInstall, promptInstall } = usePWAInstallPrompt();
  const [isPrompting, setIsPrompting] = useState(false);

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    setIsPrompting(true);
    await promptInstall();
    setIsPrompting(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={isPrompting}
      onClick={handleInstall}
      title="Installa l'app"
      className="text-primary"
    >
      <HiOutlineDevicePhoneMobile className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Installa</span>
      <span className="sr-only sm:hidden">Installa l&apos;app</span>
    </Button>
  );
}

export default InstallAppButton;
