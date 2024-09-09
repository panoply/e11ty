import { defineConfig } from 'tsup';

export default defineConfig(
  [
    {
      entry: [ './index.ts' ],
      noExternal: [ 'github-slugger' ],
      outExtension: () => ({ js: '.cjs' }),
      clean: true,
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
      noExternal: [ 'github-slugger' ],
      outExtension: () => ({ js: '.mjs' }),
      platform: 'node',
      format: [
        'esm'
      ]
    }
  ]
);
