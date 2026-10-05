import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['classProperty', 'classMethod'],
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
  prettierConfig,
);
