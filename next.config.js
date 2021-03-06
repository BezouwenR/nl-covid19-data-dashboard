const withPlugins = require('next-compose-plugins');
const withOptimizedImages = require('next-optimized-images');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  webpack(config, { dev }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: { typescript: false },
        },
      ],
      issuer: {
        test: /\.(js|ts)x?$/,
      },
    });

    if (!dev) {
      // Move Preact into the framework chunk instead of duplicating in routes:
      const splitChunks =
        config.optimization && config.optimization.splitChunks;
      if (splitChunks) {
        const cacheGroups = splitChunks.cacheGroups;
        const test = /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/;
        if (cacheGroups.framework) {
          cacheGroups.preact = Object.assign({}, cacheGroups.framework, {
            test,
          });
          // if you want to merge the 2 small commons+framework chunks:
          cacheGroups.commons.name = 'framework';
        } else {
          cacheGroups.preact = { name: 'commons', chunks: 'all', test };
        }
      }

      // Install webpack aliases:
      const aliases = config.resolve.alias || (config.resolve.alias = {});
      aliases.react = aliases['react-dom'] = 'preact/compat';
    }

    return config;
  },
};

const plugins = [
  withBundleAnalyzer,
  [withOptimizedImages, { handleImages: ['jpeg', 'png', 'webp'] }],
];

module.exports = withPlugins(plugins, nextConfig);
