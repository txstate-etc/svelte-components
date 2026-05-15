import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pluginSvelte, { rules } from 'eslint-plugin-svelte'
import love from 'eslint-config-love'
import stylistic from '@stylistic/eslint-plugin'
import svelteParser from 'svelte-eslint-parser'
import tsParser from '@typescript-eslint/parser'

const customConfig = {
  plugins: {
    ...love.plugins,
    '@stylistic': stylistic
  },
  rules: {
    ...stylistic.configs.recommended.rules,
    ...love.rules,
    'complexity': 'off', // overkill
    'eqeqeq': ['error', 'smart'],
    'import/first': 'off',
    'max-depth': 'off', // overkill
    'no-console': 'off',
    'no-multiple-empty-lines': 'off',
    'no-negated-condition': 'off', // overkill
    'no-param-reassign': 'off', // this is often necessary in svelte actions
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }], // allow normal for loops
    'no-useless-assignment': 'off', // often done for reactivity
    'prefer-named-capture-group': 'off', // do not prefer
    'require-unicode-regexp': 'off', // v flag breaks downstream vite-plugin-svelte
    'prefer-template': 'off', // unnecessary
    'promise/avoid-new': 'off',
    'no-self-assign': 'off', // self assign in svelte is to trigger reactivity
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'require-atomic-updates': 'off', // buggy, was catching variable resets
    'svelte/no-at-html-tags': 'off', // we use @html for rendering icons and other small bits of html, and it's not a security risk because the content is static and controlled by us
    'svelte/no-useless-mustaches': 'off', // might be using the mustache for html escaping
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/class-methods-use-this': 'off', // sometimes it's just for organization
    // '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }], // disabling this for now to see if eslint-config-love's default is good
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    '@typescript-eslint/no-deprecated': 'off', // this needs to be disabled until we upgrade to svelte 5
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-loop-func': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off', // this is silly, it disallows using ! to mark something as non-null
    '@typescript-eslint/no-throw-literal': 'off', // sveltekit error() function does not return an Error :/
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off', // this makes it hard to use 'any', especially in svelte where you can't assert types in template expressions
    '@typescript-eslint/no-unsafe-member-access': 'off', // this makes it hard to use 'any', especially in svelte where you can't assert types in template expressions
    '@typescript-eslint/no-unsafe-argument': 'off', // svelte-eslint-parser can't resolve types for store subscriptions and cross-component exports
    '@typescript-eslint/no-unsafe-call': 'off', // svelte-eslint-parser can't resolve types for store subscriptions and cross-component exports
    '@typescript-eslint/no-unsafe-return': 'off', // this makes it hard to use 'any', especially in svelte where you can't assert types in template expressions
    '@typescript-eslint/no-unsafe-type-assertion': 'off', // we do `as HTMLElement` a lot
    '@typescript-eslint/no-unused-vars': 'off', // typescript does this better
    '@typescript-eslint/prefer-destructuring': 'off', // no reason to force destructuring
    '@typescript-eslint/prefer-for-of': 'off', // overkill
    '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignoreConditionalTests: true, ignorePrimitives: true }], // this is supposed to be the default but apparently eslint-config-love overrode it to something stupid
    '@typescript-eslint/prefer-readonly': 'off',
    '@typescript-eslint/prefer-regexp-exec': 'off', // unhelpful
    '@typescript-eslint/require-await': 'off', // sometimes we make async functions because upstream code expects a promise, even if we don't have any awaits inside
    '@typescript-eslint/strict-boolean-expressions': 'off', // it can be very difficult to assert types in svelte template areas
    // FORMATTING RULES
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/indent': ['error', 2, { ignoreComments: true }],
    '@stylistic/max-statements-per-line': 'off',
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/space-before-function-paren': ['error', 'always']
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  ...pluginSvelte.configs['flat/recommended'],
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: love.languageOptions.parser,
        parserOptions: love.languageOptions.parserOptions
      }
    },
    ...customConfig
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ...love.languageOptions,
      parserOptions: {
        ...love.languageOptions.parserOptions,
        projectService: true
      }
    },
    ...customConfig
  }
]
