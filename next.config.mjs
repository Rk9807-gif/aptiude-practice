/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Set this to 10MB or 20MB based on your needs
    },
  },
};

export default nextConfig;
