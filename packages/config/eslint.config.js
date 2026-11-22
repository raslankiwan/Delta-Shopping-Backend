import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/**
 * Shared flat ESLint config for all Mercato workspaces.
 * Every TypeScript workspace re-exports it from its own eslint.config.js:
 *
 *   export { default } from '@mercato/config/eslint';
 *
 * The NestJS API uses `nest` instead (see below).
 */
const base = tseslint.config(
  { ignores: ['dist/**', '.next/**', 'build/**', 'node_modules/**', 'drizzle/**', '**/generated/**', '.turbo/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  prettier,
);

/**
 * NestJS variant. Nest resolves constructor injection from emitted decorator
 * metadata, so an injected class must stay a value import: converting it to
 * `import type` (what consistent-type-imports asks for) silently breaks DI.
 * `verbatimModuleSyntax` in tsconfig already enforces correct type imports.
 */
export const nest = [
  ...base,
  { rules: { '@typescript-eslint/consistent-type-imports': 'off' } },
];

export default base;
