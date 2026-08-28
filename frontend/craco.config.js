const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize bundle size
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
            materialUI: {
              test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
              name: 'material-ui',
              priority: 20,
            },
          },
        },
      };

      // Enable source maps in production for debugging
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = 'source-map';
      }

      // Add bundle analyzer plugin
      if (process.env.ANALYZE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
          })
        );
      }

      return webpackConfig;
    },
  },
};
