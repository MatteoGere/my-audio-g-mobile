import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReduxProvider } from '../store/ReduxProvider';
import { AuthProvider } from '../components/auth/AuthProvider';
import { PWAProvider } from '../components/pwa/PWAProvider';
//import { I18nProvider } from '../i18n/i18nProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MyAudioG - Audio Guide PWA',
  description: 'Discover amazing destinations through interactive audio tours with integrated maps',
  keywords: ['audio guide', 'tours', 'travel', 'pwa', 'maps', 'tourism'],
  authors: [{ name: 'MyAudioG Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyAudioG',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'MyAudioG',
    title: 'MyAudioG - Audio Guide PWA',
    description: 'Discover amazing destinations through interactive audio tours',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'MyAudioG - Audio Guide PWA',
    description: 'Discover amazing destinations through interactive audio tours',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2b8a9e' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Keep layout server-rendered; I18nProvider is a client component so we mount it inside the body
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="MyAudioG" />
        <meta name="apple-mobile-web-app-title" content="MyAudioG" />
        <meta name="msapplication-starturl" content="/" />
        <link rel="apple-touch-icon" href="/myaudiog-192.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <AuthProvider>
            <PWAProvider />
            {/* <I18nProvider defaultLocale="it">

            </I18nProvider> */}
            {children}
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
