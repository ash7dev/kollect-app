module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@/': './src/',
            '@/src': './src',
            '@/src/': './src/',
            '@app': '.',
            '@app/': './',
            // Mock React compiler runtime for React 19 compatibility
            'react/compiler-runtime': 'react/jsx-runtime',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
    ],
  };
};
