import { getGlobalData } from '../system/window';
import { TPlainObject } from '../types/define';
import { toLinkPath } from './to-link-path';
import { urlJoin } from './url-join';

/**
 * 获取指定项目模块地址
 * @param module
 */
export const getModuleUrl = (module: string, query: TPlainObject = {}) => {
  const global = getGlobalData<{ routeBaseName: string; hostUrl: string }>();
  const routeBaseName: string = global.routeBaseName;
  const hostUrl: string = global.hostUrl;
  const urlBase = urlJoin(hostUrl, routeBaseName);
  return toLinkPath(urlJoin(urlBase, module), query);
};
