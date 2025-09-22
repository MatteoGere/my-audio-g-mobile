import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication - MyAudioG',
  description: 'Sign in or create an account to access your audio guide experience',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sea-50 via-sand-50 to-forest-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      {/* Auth Header */}
      <header className="flex-shrink-0 p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <img 
            src="/myaudiog-192.svg" 
            alt="MyAudioG" 
            className="h-12 w-12"
          />
        </div>
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          MyAudioG
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Your Audio Guide Experience
        </p>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-soft p-6 border border-stone-200 dark:border-stone-700">
            {children}
          </div>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="flex-shrink-0 p-4 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
}