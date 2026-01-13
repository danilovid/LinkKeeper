const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Отключаем Expo Router, так как используем React Navigation
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'jsx', 'js', 'ts', 'tsx'],
};

module.exports = config;
