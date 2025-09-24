import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

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
  return (
    <>
      <Header
        title={title}
        showBackButton={showBackButton}
        showSearchButton={showSearchButton}
        customActions={customActions}
      />
      <BottomNavigation />
    </>
  );
}
