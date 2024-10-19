import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@flatjs/forge';
import { forgePluginStyling } from '@flatjs/forge-plugin-styling';
const __filename = fileURLToPath(import.meta.url);

const stylingPlugin = await forgePluginStyling({
  projectCwd: dirname(__filename),
  format: 'esm',
  use: ['less'],
  postcssOptions: {
    plugins: [],
  },
});

export default defineConfig({
  input: ['src/index.ts', 'src/*/index.ts'],
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
          '@dimjs/model',
          '@dimjs/utils',
          '@dimjs/lang',
          '@wove/react',
          '@dimjs/model-react',
          'dayjs',
          '@hyperse/utils',
          'tinymce',
          '@tinymce/tinymce-react',
          '@dnd-kit/core',
          '@dnd-kit/modifiers',
          '@dnd-kit/sortable',
          '@dnd-kit/utilities',
          'react-split',
          'react-ace',
          'ace-builds',
        ],
      },
    },
    dtsFilter: (dtsFile) =>
      dtsFile.split('/').length <= 2 && /index.d.ts/.test(dtsFile),
  },
  modularImports: [
    {
      libraryName: '@ant-design/icons',
      libraryDirectory: 'es/icons',
      transformToDefaultImport: true,
      camel2DashComponentName: false, // default: true
      customName(transformedMethodName) {
        return `@ant-design/icons/es/icons/${transformedMethodName}.js`;
      },
    },
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
