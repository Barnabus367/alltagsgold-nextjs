/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure base path if your app is served from a subdirectory
  // basePath: '/my-app',
  
  // Configure asset prefix for CDN
  // assetPrefix: 'https://cdn.example.com',
  
  // Configure custom webpack settings
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack configuration if needed
    return config;
  },
  
  // Configure redirects
  async redirects() {
    return [
      // Add redirects here if needed
    ];
  },
  
  // Configure rewrites
  async rewrites() {
    return [
      // Add rewrites here if needed
    ];
  },
  
  // Configure headers
  async headers() {
    return [
      // Add custom headers here if needed
    ];
  },
  
  // Configure image domains for next/image
  images: {
    domains: [
      // Add allowed image domains here
    ],
  },
  
  // Configure environment variables
  env: {
    // Custom environment variables
  },
}

module.exports = nextConfig;
