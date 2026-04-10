import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'export',
  images: { unoptimized: true },
  basePath: '/basti-portfolio',
  assetPrefix: '/basti-portfolio',
};

export default nextConfig;
