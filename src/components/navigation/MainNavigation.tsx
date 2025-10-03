import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';

interface MainNavigationProps {
  title?: string;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  customActions?: React.ReactNode;
}

export function MainNavigation({
  title,
  showBackButton,
  showSearchButton,
  customActions,
}: MainNavigationProps) {
  const actions = (
    <>
      <InstallAppButton />
      {customActions}
    </>
  );

  return (
    <>
      <Header
        title={title}
        showBackButton={showBackButton}
        showSearchButton={showSearchButton}
        customActions={actions}
      />
      <BottomNavigation />
    </>
  );
}
