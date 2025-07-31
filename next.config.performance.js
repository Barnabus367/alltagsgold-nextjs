/**
 * Performance monitoring configuration for Next.js builds
 * This file extends the main next.config.js with performance tracking
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

module.exports = (nextConfig) => {
  return {
    ...nextConfig,
    webpack: (config, options) => {
      // Apply existing webpack config
      if (nextConfig.webpack) {
        config = nextConfig.webpack(config, options);
      }

      // Add bundle analyzer in analyze mode
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: './analyze/stats.json',
          })
        );
      }

      // Add build speed measurement
      if (process.env.MEASURE === 'true') {
        const smp = new SpeedMeasurePlugin();
        return smp.wrap(config);
      }

      return config;
    },
    
    // Performance hints
    onDemandEntries: {
      // Period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // Number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 5,
    },
    
    // Experimental performance features
    experimental: {
      ...nextConfig.experimental,
      // Enable SWC minification for faster builds
      swcMinify: true,
      // Optimize server components
      serverComponents: true,
      // Enable concurrent features
      concurrentFeatures: true,
    },
  };
};