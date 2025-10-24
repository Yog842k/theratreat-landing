const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Help Next pick the correct workspace root in environments with multiple lockfiles
  outputFileTracingRoot: __dirname,
  images: {
    domains: ['localhost'],
  },
  eslint: {
    // Allow build to succeed even if there are lint warnings/errors (temporarily)
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@tldraw/state': path.resolve(__dirname, 'node_modules/@tldraw/state'),
      '@tldraw/store': path.resolve(__dirname, 'node_modules/@tldraw/store'),
      '@tldraw/tlschema': path.resolve(__dirname, 'node_modules/@tldraw/tlschema'),
      '@tldraw/editor': path.resolve(__dirname, 'node_modules/@tldraw/editor'),
      '@tldraw/tldraw': path.resolve(__dirname, 'node_modules/@tldraw/tldraw'),
      '@/components': path.resolve(__dirname, 'components'),
    };

    // NOTE: Removed previous IgnorePlugin that suppressed Razorpay API route emission.
    // It was matching the compiled route.js files and caused runtime "Cannot find module" errors
    // when Next tried to require the built server bundle. If duplicate shadow files resurface,
    // reintroduce a narrower ignore rule or delete the duplicates instead of ignoring all.
    // NOTE: Previously an IgnorePlugin suppressed server compilation of Razorpay route .js outputs.
    // It has been removed because it prevented the compiled route file (route.js) from being
    // resolved at runtime, leading to: Cannot find module .../razorpay/order/route.js
    return config;
  },
  // Use default .next in dev to avoid Windows EPERM on next-build/trace; keep custom dist in prod/CI
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'production' ? 'next-build' : '.next')
};

module.exports = nextConfig
