/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config
  images: {
    unoptimized: true,
    remotePatterns: [
      // Allow media files from the Django backend regardless of the host IP.
      // This lets the frontend load images when accessed from another device
      // using the server's local network address (e.g. 192.168.x.x:8000).
      {
        protocol: 'http',
        hostname: '**',
        port: '8000',
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
