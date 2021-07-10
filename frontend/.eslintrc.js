module.exports = {
  'extends': [
    'react-app',
    'google',
    'plugin:jsx-a11y/recommended',
  ],
  'plugins': [
    'jsx-a11y',
  ],
  'rules': {
    'require-jsdoc': ['off'],
    'no-console': ['error', {
      allow: ['info', 'warn', 'error'],
    }],
    'react-hooks/exhaustive-deps': [0],
    'react/jsx-fragments': [0],
    'react/destructuring-assignment': [0],
    'react/prop-types': [0],
    'semi': 0,
    'react/jsx-filename-extension': [1, {
      'extensions': ['.js', '.jsx'],
    }],
    'camelcase': ['off'],
    'max-len': ['warn', {
      'code': 120,
    }],
  },
}
