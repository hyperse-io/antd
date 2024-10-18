import { defineConfig } from '@flatjs/forge';

export default defineConfig({
  input: ['src/index.ts'],
  dts: {
    compilationOptions: {
      followSymlinks: false,
      preferredConfigPath: 'tsconfig.build.json',
    },
    dtsFilter: (dtsFile) =>
      dtsFile.split('/').length <= 1 && /index.d.ts/.test(dtsFile),
  },
  modularImports: [
    {
      libraryName: '@dimjs/utils',
    },
    {
      libraryName: '@dimjs/lang',
    },
    {
      libraryName: '@wove/react',
    },
  ],
  output: {
    format: 'esm',
    sourcemap: true,
  },
});
