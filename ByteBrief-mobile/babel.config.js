module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          // Avoid interfering with scoped packages like "@babel/*".
          alias: { '@/': './src/' },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
