module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es2021': true,
  },
  'extends': [
    'eslint:recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'max-len': ['error', {'code': 120}],
    'require-jsdoc': ['off'],
    'valid-jsdoc': ['off'],
  },
};
