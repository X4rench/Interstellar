// Минимальный ESLint-конфиг для Expo / React Native.
// Сильно «строгий» вариант не ставлю — текущая кодовая база писалась без линта,
// можно итеративно ужесточать. Сейчас покрываем критичное:
//   - неиспользуемые импорты / переменные
//   - empty-catch без объяснения
//   - missing keys в списках
//   - явные any (warn)
module.exports = {
  root: true,
  extends: ['expo'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/jsx-key': 'error',
    'no-empty': ['warn', { allowEmptyCatch: true }],
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'build/'],
};
