import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '/basti-portfolio' : ''

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
