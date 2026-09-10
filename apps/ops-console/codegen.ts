import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../../packages/contracts/schema.graphql',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        skipTypename: false,
        enumsAsTypes: false,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
        scalars: {
          Upload: 'File',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
