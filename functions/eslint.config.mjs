import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['lib', 'generated', 'test'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'object-curly-spacing': ['error', 'always'],
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'quote-props': ['error', 'as-needed'],
      camelcase: ['error', { properties: 'never' }],
      curly: ['error', 'multi-line'],
      'guard-for-in': 'error',
      'max-len': ['error', { code: 80, tabWidth: 2, ignoreUrls: true }],
      'new-cap': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'off',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-multi-str': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'no-var': 'error',
      'no-with': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/no-invalid-this': 'error',
    },
  },
)
