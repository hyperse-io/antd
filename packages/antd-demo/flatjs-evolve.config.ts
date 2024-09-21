import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  defineConfig,
  type EvolveEntryItemOption,
  type EvolveEntryMap,
} from '@flatjs/evolve';
import { getGlobalData } from './mocks/index.mjs';

const projectCwd = process.cwd();

const privateKey = readFileSync(
  resolve(projectCwd, './certificate/127.0.0.1+21-key.pem'),
  'utf8'
);
const certificate = readFileSync(
  resolve(projectCwd, './certificate/127.0.0.1+21.pem'),
  'utf8'
);

const getHeadBeforeScripts = (serveMode: boolean) => {
  return [
    'https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.13/dayjs.min.js',
    ...(serveMode
      ? [
          'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js',
          'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/antd/5.20.5/antd.js',
        ]
      : [
          'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js',
          'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/antd/5.20.5/antd.min.js',
        ]),
  ];
};

const getEntryMap = (
  serveMode: boolean,
  modules: Array<{ name: string; options: EvolveEntryItemOption }>
) => {
  const entryMap: EvolveEntryMap = {};
  modules.forEach((module) => {
    entryMap[`${module.name}`] = {
      entry: [`./src/${module.name}/index`],
      options: {
        favicon: '/favicon.ico',
        headBeforeScripts: getHeadBeforeScripts(serveMode),
        ...module.options,
      },
    };
  });
  return entryMap;
};

export default defineConfig((env) => ({
  projectVirtualPath: `hyperse/antd`,
  devServer: {
    https: {
      key: privateKey,
      cert: certificate,
    },
    webSocketURL: {
      // hostname: 'oss.hyperse.net',
    },
    mockOptions: {
      port: 8000,
      staticMap: {
        '/static': 'static',
      },
    },
    defaultServeGlobalData: async (_entry, hostUrl) => {
      return getGlobalData(hostUrl);
    },
  },
  loaderOptions: {
    pixelOptions: false,
    modularImports: [
      {
        libraryName: '@ant-design/icons',
        libraryDirectory: 'es/icons',
        transformToDefaultImport: true,
        camel2DashComponentName: false, // default: true
      },
      {
        libraryName: '@wove/react',
      },
      {
        libraryName: '@dimjs/secure',
      },
      {
        libraryName: '@dimjs/lang',
      },
      {
        libraryName: '@dimjs/utils',
      },
      {
        libraryName: '@kzfoo/react',
      },
    ],
  },
  multiHtmlCdn: {
    me: ['http://localhost:8000/public/'],
  },
  multiHtmlCdnEnvResolver: function envResolver() {
    return ~location.href.indexOf('localhost') ? 'me' : undefined;
  },
  webpack: {
    externals: {
      antd: 'antd',
      dayjs: 'dayjs',
    },
  },
  globalCompilerOptions: {
    runTsChecker: true,
  },
  entryMap: getEntryMap(env.command === 'serve', [
    {
      name: 'utils',
      options: {
        title: '',
      },
    },
  ]),
}));
