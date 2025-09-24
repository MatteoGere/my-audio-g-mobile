'use client';

import { Card, Button, Switch } from '@/components/ui';
import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';

export default function ProfilePage() {
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <NavigationGuard requireAuth={true}>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 text-xl font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                {user?.email}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">Audio Guide Explorer</p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Settings
          </h3>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-stone-900 dark:text-stone-100">
                    Push Notifications
                  </h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Get notified about new tours
                  </p>
                </div>
                <Switch />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-stone-900 dark:text-stone-100">
                    Auto-play Next Track
                  </h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Automatically play the next audio track
                  </p>
                </div>
                <Switch />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-stone-900 dark:text-stone-100">
                    Download over WiFi only
                  </h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Save mobile data usage
                  </p>
                </div>
                <Switch />
              </div>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">12</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Tours Completed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">5</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Favorites</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">24h</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Listening Time</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-forest-600 dark:text-forest-400">8</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Cities Visited</div>
            </Card>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full">
            Download History
          </Button>
          <Button
            variant="ghost"
            className="w-full text-error-600 hover:text-error-700"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </NavigationGuard>
  );
}
