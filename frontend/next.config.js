/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
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
    pathname: '/media/uploads/**',
  });
}

module.exports = nextConfig;
