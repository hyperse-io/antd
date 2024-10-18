import { uriParse } from '@dimjs/utils';
import { getGlobalData } from '../system';
import { ensureSlash } from './ensure-slash';
import { isHttpUri } from './is-http-url';

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
