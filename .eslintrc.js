const eslintSveltePreprocess = require('./eslint-svelte-preprocess')

module.exports = {
  extends: 'standard-with-typescript',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.eslint.json'
  },
  plugins: ['svelte3', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  settings: {
    'svelte3/preprocess': eslintSveltePreprocess()
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // typescript does this better
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/return-await': ['error', 'always'],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/prefer-readonly': ['off']
  }
}
