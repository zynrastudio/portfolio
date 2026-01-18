import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Site configuration
  env: {
    SITE_URL: process.env.SITE_URL || 'https://zynra.studio',
  },
  // Enable strict mode for better error handling
  reactStrictMode: true,
  // Optimize production builds
  poweredByHeader: false,
};

export default nextConfig;
