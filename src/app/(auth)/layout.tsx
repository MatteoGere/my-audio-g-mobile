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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-marble-50 to-accent/5">
      {/* Auth Header */}
      <header className="flex-shrink-0 p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-medium">
              <img src="/myaudiog-192.svg" alt="MyAudioG" className="h-10 w-10" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MyAudioG
        </h1>
        <p className="text-sm text-muted mt-2">Your Audio Guide Experience</p>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card
            padding="lg"
            className="bg-gradient-to-br from-surface to-surface/95 backdrop-blur-xl rounded-2xl shadow-strong border border-primary/20"
          >
            {children}
          </Card>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="flex-shrink-0 p-4 text-center">
        <p className="text-xs text-muted">
          By continuing, you agree to our{' '}
          <span className="text-primary font-medium">Terms of Service</span> and{' '}
          <span className="text-primary font-medium">Privacy Policy</span>
        </p>
      </footer>
    </div>
  );
}
