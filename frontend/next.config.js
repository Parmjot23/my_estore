/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const { protocol, hostname, port } = new URL(apiUrl);

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: protocol.replace(':', ''),
        hostname,
        port,
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

module.exports = nextConfig;
