import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  /* config options here */
  webpack: (config, { isServer }) => {
    // Handle Node.js module resolution issues in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
      };
    }
    // This line was missing - it's required!
    return config;
  },
};

export default nextConfig;
