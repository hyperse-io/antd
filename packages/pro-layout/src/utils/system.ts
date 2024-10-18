import { isArray } from '@dimjs/lang';
import {
  getGlobalData,
  sessionStorageCache,
  TPlainObject,
} from '@hyperse/utils';
import { TGlobalData } from '../types';

export const globalData = getGlobalData<TGlobalData>();
const iframeOpenNewTabItemOperateLinkKey =
  'iframe-open-new-tab-item-operate-link';

/**
 * 保存操作 OpenNewTabItem 链路
 */
export const saveIframeOpenNewTabItemOperateLink = (params: {
  startTabId: string;
  startTabMenuId?: string;
  endTabId: string;
}) => {
  const operateLinkData = sessionStorageCache.get(
    iframeOpenNewTabItemOperateLinkKey
  );
  const dataList = (
    isArray(operateLinkData?.dataList) ? operateLinkData?.dataList : []
  ) as TPlainObject[];
  dataList.push(params);
  sessionStorageCache.set(iframeOpenNewTabItemOperateLinkKey, {
    dataList: dataList,
  });
};

export const getIframeOpenNewTabItemOperateLinkList = () => {
  const operateLinkData = sessionStorageCache.get(
    iframeOpenNewTabItemOperateLinkKey
  );
  return (
    isArray(operateLinkData?.dataList) ? operateLinkData?.dataList : []
  ) as TPlainObject[];
};
