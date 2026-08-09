module.exports = function (api) {
  api.cache(true);
  // Cache bust worklets v0.10.1


  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      'react-native-worklets/plugin',
    ],
  };
};
