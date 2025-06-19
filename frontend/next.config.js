/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Disable Next.js image optimization so external URLs are served directly
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

if (process.env.NEXT_PUBLIC_BACKEND_HOST) {
  nextConfig.images.remotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_BACKEND_HOST,
    pathname: '/media/**',
  });
}

module.exports = nextConfig;
