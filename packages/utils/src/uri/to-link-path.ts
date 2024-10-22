import { isArray } from '@dimjs/lang';
import { getQueryString, modifyQueryString } from '@dimjs/utils';
import { isMockMeEnv } from '../system/env.js';
import { getWindow } from '../system/window.js';
import { type TPlainObject } from '../types/define.js';

const userAgent = () => {
  return navigator.userAgent.toLowerCase();
};

const isFabricWebview = () => {
  return new RegExp('fabric@', 'i').test(userAgent());
};

/**
 * 向path中拼接query数据，内部项目使用
 * ```
 * 1.默认query值
 *  1). env 非生产环境有效
 *  2). fabric-callback-key【webview通信key值】
 *  3). accessToken【env=me环境下有效】
 *  4). 业务流程参数 window.bizProcessUrlParam 配置的key值
 * 2.query中undefined会被过滤
 * ```
 */
export const toLinkPath = (path: string, query: TPlainObject = {}) => {
  const newQauery = { ...query, ntv_indicator: '1' } as TPlainObject;
  const env = getQueryString('env');
  if (env && env !== 'prod') {
    newQauery.env = env;
  }

  const media = getQueryString('media');
  if (media) {
    newQauery.media = media;
  }

  if (window['ntv_indicator'] === false || !isFabricWebview()) {
    newQauery.ntv_indicator = undefined;
  }

  // 业务流程参数
  const bizProcessUrlParam = getWindow<string[]>('bizProcessUrlParam');
  if (isArray(bizProcessUrlParam) && bizProcessUrlParam.length > 0) {
    bizProcessUrlParam.forEach((paramKey) => {
      const keyValue = getQueryString(paramKey);
      if (keyValue) {
        newQauery[paramKey] = keyValue;
      }
    });
  }

  const fabricCallbackKey = getQueryString('fabric-callback-key') || '';
  if (fabricCallbackKey) {
    newQauery['fabric-callback-key'] = fabricCallbackKey;
  }

  const accessToken = getQueryString('accessToken') || '';
  if (accessToken && isMockMeEnv()) {
    newQauery.accessToken = accessToken;
  }
  // 将query中的值为 undefined 过滤了
  const filterQuery = {} as TPlainObject;
  Object.keys(newQauery).filter((key) => {
    if (newQauery[key] !== undefined && newQauery[key] !== null) {
      filterQuery[key] = newQauery[key];
    }
  });
  return modifyQueryString(path, filterQuery);
};
