import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReduxProvider } from '@/lib/redux';
import { I18nProvider } from '@/i18n/I18nProvider';

export const metadata: Metadata = {
  title: 'MyAudioG - Audio Guide Experience',
  description: 'Discover immersive audio tours and travel experiences with interactive maps and offline support',
  manifest: '/manifest.json',
  keywords: ['audio guide', 'travel', 'tours', 'maps', 'offline'],
  authors: [{ name: 'MyAudioG Team' }],
  creator: 'MyAudioG',
  publisher: 'MyAudioG',
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
    apple: [
      { url: '/myaudiog-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2b8a9e' },
    { media: '(prefers-color-scheme: dark)', color: '#66c0a3' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-sand-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 min-h-screen">
        <ReduxProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}