/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Cloudinary-Integration für Next.js Image
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.shopify.com',
      'via.placeholder.com'
    ],
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.js',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 86400, // 24 Stunden
  },
  
  // Performance-Optimierungen
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  
  // Vercel-spezifische Optimierungen
  poweredByHeader: false,
  compress: true,
  
  // Bundle Analyzer für Performance-Monitoring
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        cloudinary: {
          name: 'cloudinary',
          test: /[\\/]lib[\\/]cloudinary/,
          priority: 20,
          chunks: 'all',
        },
        shopify: {
          name: 'shopify', 
          test: /[\\/]lib[\\/]shopify/,
          priority: 20,
          chunks: 'all',
        }
      };
    }
    
    return config;
  },
  
  // Environment-Variable für Cloudinary
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  }
}

module.exports = nextConfig