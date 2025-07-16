const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

/**
 * This is needed to pass npx expo-doctor
 * See above: https://github.com/expo/expo/issues/34901#issuecomment-2657424039
 */
config.transformer = {
  ...config.transformer,
  _expoRelativeProjectRoot: __dirname,
};

module.exports = config; 