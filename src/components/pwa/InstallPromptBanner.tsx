'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { usePWAInstallPrompt } from '@/lib/hooks';

export function InstallPromptBanner() {
  const { canInstall, hasDismissed, promptInstall, dismissInstallPrompt } = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (canInstall && !hasDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [canInstall, hasDismissed]);

  if (!isVisible) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    setErrorMessage(null);

    const outcome = await promptInstall();
    setIsInstalling(false);

    if (outcome === 'unavailable') {
      setErrorMessage('Installazione non disponibile su questo dispositivo.');
    } else {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
  };

  return (
    <Card
      padding="lg"
      variant="outline"
      className="flex flex-col gap-4 border-primary/20 bg-primary/5"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <HiOutlineDevicePhoneMobile className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <CardTitle className="text-lg">Installa MyAudioG</CardTitle>
          <CardDescription className="text-sm text-foreground/80">
            Salva l&apos;app nella schermata principale per un accesso rapido anche a schermo intero.
          </CardDescription>
          {errorMessage && <p className="text-xs text-error">{errorMessage}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="w-full sm:w-auto"
        >
          Più tardi
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={isInstalling}
          onClick={handleInstallClick}
          className="w-full sm:w-auto"
        >
          Installa ora
        </Button>
      </div>
    </Card>
  );
}

export default InstallPromptBanner;
