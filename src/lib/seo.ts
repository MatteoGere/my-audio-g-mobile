import { Metadata } from 'next';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

export function generateSEOMetadata({
  title = 'MyAudioG - Audio Guide PWA',
  description = 'Discover amazing destinations through interactive audio tours with integrated maps',
  keywords = ['audio guide', 'tours', 'travel', 'pwa', 'maps', 'tourism'],
  image = '/myaudiog-512.svg',
  url = '/',
  type = 'website',
}: SEOMetaProps = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myaudiog.com';
  const fullUrl = `${baseUrl}${url}`;
  const fullImageUrl = `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'MyAudioG Team' }],
    creator: 'MyAudioG Team',
    publisher: 'MyAudioG',
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      url: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': '/en',
        'it-IT': '/it',
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      alternateLocale: ['it_IT'],
      siteName: 'MyAudioG',
      title,
      description,
      url: fullUrl,
      images: [
        {
          url: fullImageUrl,
          width: 512,
          height: 512,
          alt: title,
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@myaudiog',
      creator: '@myaudiog',
      title,
      description,
      images: [fullImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      other: {
        'apple-mobile-web-app-capable': ['yes'],
        'apple-mobile-web-app-status-bar-style': ['default'],
        'mobile-web-app-capable': ['yes'],
      },
    },
  };
}