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
    // Force single instance of tldraw state libs to avoid whiteboard runtime warning
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@tldraw/state': path.resolve(__dirname, 'node_modules/@tldraw/state'),
      '@tldraw/store': path.resolve(__dirname, 'node_modules/@tldraw/store'),
      '@tldraw/tlschema': path.resolve(__dirname, 'node_modules/@tldraw/tlschema'),
      '@tldraw/editor': path.resolve(__dirname, 'node_modules/@tldraw/editor'),
      '@tldraw/tldraw': path.resolve(__dirname, 'node_modules/@tldraw/tldraw'),
    };
    return config;
  },
  // Use a custom distDir to avoid lingering locked .next/trace file issues on Windows
  distDir: '.next-build'
};

module.exports = nextConfig
