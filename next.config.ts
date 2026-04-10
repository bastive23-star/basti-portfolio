import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? '/basti-portfolio' : ''

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
