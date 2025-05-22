/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Or 'https' if your local Django serves over HTTPS
        hostname: 'localhost',
        port: '8000', // Specify the port your Django backend is using for media
        pathname: '/media/**', // Be more specific if all your media is under /media/
      },
      {
        protocol: 'https', // For the placeholder images
        hostname: 'placehold.co',
        // port: '', // Default port for https is 443
        // pathname: '/**', // Allow all paths from this placeholder domain
      },
      // You can add other hostnames here if needed in the future
    ],
  },
};

module.exports = nextConfig;
