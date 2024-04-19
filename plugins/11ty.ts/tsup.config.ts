import { defineConfig } from 'tsup';

export default defineConfig(
  [
    {
      entry: [ './index.ts' ],
      outExtension: () => ({ js: '.cjs' }),
      clean: true,
      dts: {
        resolve: true,
        entry: 'index.ts'
      },
      platform: 'node',
      format: [
        'cjs'
      ]
    },
    {
      entry: [ './index.ts' ],
      outExtension: () => ({ js: '.mjs' }),
      platform: 'node',
      format: [
        'esm'
      ]
    }
  ]
);
