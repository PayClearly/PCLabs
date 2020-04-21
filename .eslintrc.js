module.exports = {
  env: {
    node: true,
    commonjs: true,
    mocha: true,
    es6: true
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    indent: [ 'error', 2 ],
    'linebreak-style': ['error', 'unix' ],
    quotes: [ 0 ],
    semi: [ 'error', 'always' ],
    'no-unused-vars': ['error', { 'args': 'none' }]
  }
};
