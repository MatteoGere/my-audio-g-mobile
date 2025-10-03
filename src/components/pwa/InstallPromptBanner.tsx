'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardTitle, CardDescription } from '@/components/ui';
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
      className="flex flex-col gap-4 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-soft"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-soft">
          <HiOutlineDevicePhoneMobile className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
            Installa MyAudioG
          </CardTitle>
          <CardDescription className="text-sm text-foreground/80 leading-relaxed">
            Salva l&apos;app nella schermata principale per un accesso rapido anche a schermo
            intero.
          </CardDescription>
          {errorMessage && (
            <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20">
              <p className="text-xs text-error font-medium">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="w-full sm:w-auto hover:bg-marble-100/50"
        >
          Più tardi
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={isInstalling}
          onClick={handleInstallClick}
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-soft"
        >
          Installa ora
        </Button>
      </div>
    </Card>
  );
}

export default InstallPromptBanner;
