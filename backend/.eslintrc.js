module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true,
  },
  'parser': 'babel-eslint',
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'require-jsdoc': [
      'off',
    ],
    'camelcase': [
      'off',
    ],
    'no-tabs': [
      'off',
    ],
    'no-mixed-spaces-and-tabs': [
      'off',
    ],
    'max-len': [
      'off',
    ],
  },
};
