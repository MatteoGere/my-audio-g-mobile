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
        <Card padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{user?.email}</h2>
              <p className="text-sm text-muted">Audio Guide Explorer</p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
          <div className="space-y-4">
            <Card padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Push Notifications</h4>
                  <p className="text-sm text-muted">Get notified about new tours</p>
                </div>
                <Switch />
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Auto-play Next Track</h4>
                  <p className="text-sm text-muted">Automatically play the next audio track</p>
                </div>
                <Switch />
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Download over WiFi only</h4>
                  <p className="text-sm text-muted">Save mobile data usage</p>
                </div>
                <Switch />
              </div>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card padding="md" className="text-center">
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted">Tours Completed</div>
            </Card>
            <Card padding="md" className="text-center">
              <div className="text-2xl font-bold text-foreground">5</div>
              <div className="text-sm text-muted">Favorites</div>
            </Card>
            <Card padding="md" className="text-center">
              <div className="text-2xl font-bold text-foreground">24h</div>
              <div className="text-sm text-muted">Listening Time</div>
            </Card>
            <Card padding="md" className="text-center">
              <div className="text-2xl font-bold text-foreground">8</div>
              <div className="text-sm text-muted">Cities Visited</div>
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
            className="w-full text-error hover:text-error"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </NavigationGuard>
  );
}
