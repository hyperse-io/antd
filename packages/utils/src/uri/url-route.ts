import { uriParse } from '@dimjs/utils';
import { getGlobalData } from '../system/window.js';
import { ensureSlash } from './ensure-slash.js';
import { isHttpUri } from './is-http-url.js';

export const getUrlRoute = (url: string) => {
  if (!isHttpUri(url)) return url;
  const pathname = uriParse(url || '').pathname || '';
  const { routeBaseName } = getGlobalData<{ routeBaseName: string }>();
  const route = ensureSlash(pathname, true).replace(
    ensureSlash(routeBaseName, true),
    ''
  );
  return `/${ensureSlash(route, false)}`;
};
