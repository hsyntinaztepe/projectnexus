const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'usdz', 'obj', 'mtl', 'png', 'jpg'];

// Reduce worker count to prevent memory exhaustion during bundling
config.maxWorkers = 2;

// Increase transformer timeout
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Lazy load modules - helps with large bundles like three.js
    },
  }),
};

module.exports = config;
