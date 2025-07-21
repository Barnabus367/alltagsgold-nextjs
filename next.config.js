/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // HOT RELOAD KOMPLETT DEAKTIVIERT - ENDGÜLTIGE LÖSUNG
  experimental: {
    swcPlugins: [],
  },
  
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 1. Entferne ALLE Hot Module Replacement Plugins
      config.plugins = config.plugins.filter(plugin => {
        const name = plugin.constructor.name;
        return ![
          'HotModuleReplacementPlugin', 
          'ReactRefreshPlugin',
          'ReactRefreshWebpackPlugin'
        ].includes(name);
      });
      
      // 2. Deaktiviere File Watching komplett
      config.watchOptions = false;
      config.watch = false;
      
      // 3. Entferne React Refresh aus allen Loadern
      const removeReactRefresh = (rules) => {
        rules.forEach(rule => {
          if (rule.oneOf) {
            removeReactRefresh(rule.oneOf);
          }
          if (rule.use && Array.isArray(rule.use)) {
            rule.use = rule.use.filter(use => {
              if (typeof use === 'object' && use.loader) {
                return !use.loader.includes('react-refresh');
              }
              if (typeof use === 'string') {
                return !use.includes('react-refresh');
              }
              return true;
            });
          }
        });
      };
      removeReactRefresh(config.module.rules);
      
      // 4. Verhindere Hot Updates komplett
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      
      // 5. Deaktiviere Development-Server Features
      config.devServer = {
        ...config.devServer,
        hot: false,
        liveReload: false,
        watchFiles: false,
      };
      
      // 6. Entferne Hot Update Outputs
      delete config.output.hotUpdateChunkFilename;
      delete config.output.hotUpdateMainFilename;
      config.output.hotUpdateFunction = undefined;
    }
    return config;
  },
  


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        port: '',
        pathname: '/tr*',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Experimentelle Features nur für Production
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', '@tanstack/react-query'],
    // optimizeCss: true, // Temporär deaktiviert wegen Build-Issues
  },
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Vercel-optimierte Ausgabe
  output: 'standalone',
  
  // Cross-Origin Fix für Replit
  allowedDevOrigins: [
    'https://99f32813-56f3-45c6-ab81-10409e70272f-00-3q6itt484t6nr.worf.replit.dev',
    '*.replit.dev',
    '*.replit.co'
  ],
  
  // Webpack-Optimierungen für bessere Performance
  webpack: (config, { dev, isServer, buildId }) => {
    if (dev) {
      config.cache = false; // Deaktiviert hartnäckige Caches
      config.optimization.moduleIds = 'named';
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    } else if (!isServer) {
      // Production Bundle Splitting
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          shopify: {
            test: /[\\/]node_modules[\\/].*shopify.*/,
            name: 'shopify',
            chunks: 'all',
            priority: 20,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
            priority: 15,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 25,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig
