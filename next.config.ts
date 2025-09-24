import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Image optimization control removed per request
  outputFileTracingRoot: path.resolve(__dirname),
  eslint: {
    // Don't block production builds on ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
