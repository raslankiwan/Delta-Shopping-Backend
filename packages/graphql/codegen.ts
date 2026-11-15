import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Generates typed operations from the .graphql documents in src/operations
 * against the live API schema (introspection). Run the API first, then:
 *   bun run --cwd packages/graphql codegen
 * Override the endpoint with GRAPHQL_SCHEMA_URL if the API isn't on :9000.
 */
const config: CodegenConfig = {
  schema: process.env.GRAPHQL_SCHEMA_URL ?? 'http://localhost:9000/graphql',
  documents: ['src/operations/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: { useTypeImports: true, scalars: { DateTime: 'string' } },
    },
  },
};

export default config;
