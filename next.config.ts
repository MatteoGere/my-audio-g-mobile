import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PWA and performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Image optimization
  images: {
    domains: [
      'supabase.co', // Add your Supabase domain
      'xknweifwtllubmkwbdbe.supabase.co',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for PWA and security
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack optimization for PWA
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client bundle for PWA
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
