module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Temporarily disabled react-native-reanimated plugin due to worklets compatibility issues
    // plugins: [
    //   'react-native-reanimated/plugin',
    // ],
  };
};

