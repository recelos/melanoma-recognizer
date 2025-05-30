module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@firebase|firebase|@react-native-picker|expo(nent)?|@expo|@unimodules|unimodules|sentry-expo|native-base)',
  ],
};
