/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tosyulolriavzgkpwzrn.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
