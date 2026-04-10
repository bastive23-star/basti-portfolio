import type { NextConfig } from "next";

// basePath is set via .env.production (NEXT_PUBLIC_BASE_PATH=/basti-portfolio)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
