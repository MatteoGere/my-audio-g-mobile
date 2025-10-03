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
      { url: '/myaudiog-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/myaudiog-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/myaudiog-180.png', sizes: '180x180', type: 'image/png' }],
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
  themeColor: '#2b8a9e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS-specific PWA meta tags */}
        <link rel="apple-touch-icon" href="/myaudiog-180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/myaudiog-180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/myaudiog-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MyAudioG" />
        
        {/* Additional iOS splash screens (optional but recommended) */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iphone-15-pro-max.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iphone-15-pro.png"
        />
      </head>
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