import {
  matchPath,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { paramStrToJson, pick } from '@dimjs/utils';
import { ensureSlash, removeSlash, type TPlainObject } from '@hyperse/utils';
import { type BreadConfigItem, type BreadDataItem } from '../types/route.js';

export type UseBreadRoute = {
  path: string;
  name: string;
  query: Record<string, string>;
};

export const useBread = (
  breads: BreadConfigItem[],
  routeBaseName: string
): UseBreadRoute[] => {
  const params = useParams();
  const location = useLocation();
  const [search] = useSearchParams();
  const newBreadList = breads.map((item) => {
    const breadData =
      typeof item.breadConfig === 'function'
        ? item.breadConfig({ params, search })
        : item.breadConfig;
    return { ...breadData, path: item.path };
  }) as BreadDataItem[];
  routeBaseName = ensureSlash(routeBaseName);

  const locationBreadPath = ensureSlash(
    location.pathname.replace(routeBaseName, '')
  );

  let routes = newBreadList.map((s) => {
    const pathFn = s.to || s.path;
    const path =
      typeof pathFn === 'function' ? pathFn({ params, search }) : pathFn;
    const query = s.query || [];
    const allQueries = paramStrToJson(window.location.href);
    const savedQueries = pick<TPlainObject, string>(
      allQueries,
      ['env'].concat(query)
    );
    const name = typeof s.name === 'function' ? s.name() : s.name;
    return {
      path,
      name: name,
      query: savedQueries,
    };
  });

  /**
   * 当路由中存在动态参数时，解决参数匹配替换问题
   * 1. 路由path链路
   * a/b
   * a/b/:id
   * a/b/:id/detail
   * =>
   * 动态参数id = 123
   * a/b
   * a/b/123
   * a/b/123/detail
   */

  // 从长到短排序
  routes = routes.sort((a, b) => b.path?.length - a.path?.length);

  const lastPathTarget = routes.find((item) => {
    return (
      matchPath(ensureSlash(item.path), locationBreadPath) ||
      ensureSlash(item.path) === '//' ||
      locationBreadPath.includes(ensureSlash(item.path))
    );
  });

  if (lastPathTarget === undefined || lastPathTarget === null) return [];
  const routesNew = routes
    .sort((a, b) => a.path?.length - b.path?.length)
    .filter((item) =>
      ensureSlash(lastPathTarget.path).includes(ensureSlash(item.path))
    );

  const marchParams = matchPath(
    ensureSlash(lastPathTarget.path),
    locationBreadPath
  )?.params;

  const resultRoutes = routesNew.map((item) => {
    if (marchParams) {
      let pathFmt = ensureSlash(item.path);
      Object.keys(marchParams).forEach((key) => {
        if (pathFmt.includes(`/:${key}/`)) {
          pathFmt = pathFmt.replace(`/:${key}/`, `/${marchParams[key]}/`);
        }
      });
      item.path = removeSlash(pathFmt, 'after');
    }
    return item;
  });
  return resultRoutes;
};
