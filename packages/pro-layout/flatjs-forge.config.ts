import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@flatjs/forge';
import { forgePluginStyling } from '@flatjs/forge-plugin-styling';
const __filename = fileURLToPath(import.meta.url);

const stylingPlugin = forgePluginStyling({
  projectCwd: dirname(__filename),
  format: 'esm',
  use: ['less'],
  postcssOptions: {
    plugins: [],
  },
});

export default defineConfig({
  input: ['src/index.ts'],
  dts: {
    compilationOptions: {
      followSymlinks: false,
      preferredConfigPath: 'tsconfig.build.json',
    },
    entryPointOptions: {
      libraries: {
        importedLibraries: [
          'react',
          'antd',
          'ahooks',
          '@dimjs/model',
          '@dimjs/utils',
          '@dimjs/lang',
          '@wove/react',
          '@dimjs/model-react',
          'dayjs',
          '@hyperse/utils',
          '@hyperse/antd',
        ],
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
      libraryName: '@hyperse/antd',
    },
  ],
  plugin: {
    extraPlugins: [stylingPlugin],
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
