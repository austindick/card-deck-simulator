module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer/"),
    "url": require.resolve("url/"),
    "stream": require.resolve("stream-browserify"),
    "process": require.resolve("process/browser"),
  };

  config.plugins = [
    ...config.plugins,
    new (require('webpack')).ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  return config;
}; 