import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/transfer-printing/:path*",
        destination: "/promotional-products",
        permanent: true,
      },
      {
        source: "/custom-apparel/:path*",
        destination: "/promotional-products",
        permanent: true,
      },
      {
        source: "/random-products/:path*",
        destination: "/promotional-products",
        permanent: true,
      },
      {
        source: "/instruction/:path*",
        destination: "/promotional-products",
        permanent: true,
      },
      {
        source: "/jerseys/:path*",
        destination: "/promotional-products",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;