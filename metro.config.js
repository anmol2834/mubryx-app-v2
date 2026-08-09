const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  input: path.resolve(__dirname, 'src/global.css'),
  inlineRem: 16,
});
