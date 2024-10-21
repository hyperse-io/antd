import { getGlobalData } from '../system/window.js';
import { TPlainObject } from '../types/define.js';
import { toLinkPath } from './to-link-path.js';
import { urlJoin } from './url-join.js';

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
