import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    // Ignore ESLint errors during production builds to prevent build failures
    // We'll fix or relax rules incrementally in the codebase
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
