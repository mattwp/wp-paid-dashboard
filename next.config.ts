import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/wp-paid-dashboard',
  images: { unoptimized: true },
};

export default nextConfig;
