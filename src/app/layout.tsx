import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReduxProvider } from '@/lib/redux';
import { I18nProvider } from '@/i18n/I18nProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import NextThemeProvider from '@/components/theme/NextThemeProvider';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'MyAudioG - Audio Guide Experience',
  description:
    'Discover immersive audio tours and travel experiences with interactive maps and offline support',
  keywords: ['audio guide', 'travel', 'tours', 'maps', 'offline'],
  authors: [{ name: 'MyAudioG Team' }],
  creator: 'MyAudioG',
  publisher: 'MyAudioG',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/myaudiog-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/myaudiog-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/myaudiog-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MyAudioG',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
  // Use a single theme color; theming is controlled via the UI (class-based)
  themeColor: '#2b8a9e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-marble-50 text-carbon-900 min-h-screen">
        <NextThemeProvider>
          <ReduxProvider>
            <AuthProvider>
              <I18nProvider>{children}</I18nProvider>
            </AuthProvider>
          </ReduxProvider>
        </NextThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
