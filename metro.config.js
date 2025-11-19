const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude Electron files from Metro bundling
config.resolver.blockList = [
  /electron\/.*/,
  /electron-main\.js$/,
  /electron-preload\.js$/,
];

module.exports = config;