import { getHostUrlAndRouteBaseName } from '../../utils';
import { currentIsIframe } from './iframe-tab-mode';

const guessNoLayoutLink = (url: string) => {
  const { routeBaseName } = getHostUrlAndRouteBaseName(url);
  const main = `${routeBaseName}/main/`;
  if (url.indexOf(main) >= 0) {
    return url.replace(main, `${routeBaseName}/`);
  }
  return url;
};

/**
 * No Layout 模块使用
 * ```
 * 当No Layout存在于ifram tab中时，触发逻辑跳转正常访问页面（包含菜单）
 * ```
 */
export const NoLayoutMode = (props) => {
  if (currentIsIframe()) {
    window.parent.location.href = guessNoLayoutLink(location.href);
    return null;
  }
  return props.children;
};
