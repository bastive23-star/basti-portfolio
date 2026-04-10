import type { NextConfig } from "next";

// On GitHub Actions the runner sets GITHUB_ACTIONS=true automatically — use that
// as a reliable signal instead of env-loading which Turbopack can swallow.
const basePath =
  process.env.GITHUB_ACTIONS === 'true'
    ? '/basti-portfolio'
    : (process.env.NEXT_PUBLIC_BASE_PATH ?? '')

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
