module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: 'standard-with-typescript',
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs', 'package/**/*', 'svelte.config.js', 'playwright.config.js'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
  rules: {
    'import/first': 'off',
		'no-multiple-empty-lines': 'off',
    'no-undef-init': 'off',
		'no-unused-vars': 'off',
		'no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // typescript does this better
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/return-await': ['error', 'always'],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/prefer-readonly': ['off']
  },
	parserOptions: {
		project: './tsconfig.json',
		sourceType: 'module',
		extraFileExtensions: ['.svelte'],
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
