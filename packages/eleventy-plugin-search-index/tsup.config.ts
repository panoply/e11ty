import { defineConfig } from 'tsup';

export default defineConfig(
  [
    {
      entry: [ './index.ts' ],
      outExtension: () => ({ js: '.cjs' }),
      clean: true,
      bundle: true,
      noExternal: [
        'github-slugger'
      ],
      dts: {
        resolve: true,
        entry: 'index.ts',
        compilerOptions: {
          esModuleInterop: true
        }
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
