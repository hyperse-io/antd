import { defineConfig } from '@flatjs/forge';

export default defineConfig({
  input: ['src/index.ts', 'src/*/index.ts'],
  dts: {
    compilationOptions: {
      followSymlinks: false,
      preferredConfigPath: 'tsconfig.build.json',
    },
    entryPointOptions: {
      libraries: {
        importedLibraries: ['react'],
      },
    },
    dtsFilter: (dtsFile) =>
      dtsFile.split('/').length <= 2 && /index.d.ts/.test(dtsFile),
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
    {
      libraryName: '@ant-design/icons',
      libraryDirectory: 'es/icons',
      transformToDefaultImport: true,
      camel2DashComponentName: false, // default: true
      customName(transformedMethodName) {
        return `@ant-design/icons/es/icons/${transformedMethodName}.js`;
      },
    },
  ],
  plugin: {
    pluginConfigs: {
      babelOptions: {
        usePreset: 'react',
      },
    },
  },
  output: {
    format: 'esm',
    sourcemap: true,
  },
});
