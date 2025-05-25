/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const { protocol, hostname, port } = new URL(apiUrl);

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      // Allow media files from the Django backend regardless of the host IP.
      // This lets the frontend load images when accessed from another device
      // using the server's local network address (e.g. 192.168.x.x:8000).
      {

        pathname: '/media/**',
      },
      // Placeholder images
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

module.exports = nextConfig;
