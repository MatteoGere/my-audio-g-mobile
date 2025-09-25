import type { Metadata } from 'next';
import { Card } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Authentication - MyAudioG',
  description: 'Sign in or create an account to access your audio guide experience',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-marble-50 to-teal-50">
      {/* Auth Header */}
      <header className="flex-shrink-0 p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <img src="/myaudiog-192.svg" alt="MyAudioG" className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold text-primary">MyAudioG</h1>
        <p className="text-sm text-muted mt-1">
          Your Audio Guide Experience
        </p>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card padding="lg" className="bg-surface rounded-2xl shadow-soft border border-muted">
            {children}
          </Card>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="flex-shrink-0 p-4 text-center">
        <p className="text-xs text-muted">By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </footer>
    </div>
  );
}
