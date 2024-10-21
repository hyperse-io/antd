import { isArray } from '@dimjs/lang';
import { TPlainObject } from '../types/define.js';

/**
 * 树结构数据，复制字段数据为新字段值（配置方式）
 * ```
 * 1. changeFieldNames => { '原字段': '新字段' }，原字段与新字段同时存在
 * 2. childrenName tree结构数据children字段名称，默认值：children
 * ```
 */
export const treeFieldNameChange = (
  treeList: TPlainObject[],
  changeFieldNames: TPlainObject<string>,
  childrenName?: string
) => {
  const childrenKey = childrenName || 'children';
  const changeFieldList = Object.keys(changeFieldNames);
  function loopHandle(dataItem) {
    if (!dataItem) return;
    changeFieldList.forEach((fieldKey) => {
      dataItem[changeFieldNames[fieldKey]] = dataItem[fieldKey];
    });

    if (dataItem[childrenKey] && isArray(dataItem[childrenKey])) {
      dataItem[childrenKey].map((node) => {
        loopHandle(node);
      });
    }
  }

  treeList.forEach((dataItem) => {
    loopHandle(dataItem);
  });

  return treeList;
};

/**
 * 树结构数据，复制字段数据为新字段值（适配器方式）
 * ```
 * 1. treeItemAdapter 适配器，可在返回值添加新字段数据
 * 2. childrenName tree结构数据children字段名称，默认值：children
 * ```
 */
export const treeFieldNameChangeAdapter = (
  treeList: TPlainObject[],
  treeItemAdapter: (treeItem: TPlainObject) => TPlainObject,
  childrenName?: string
) => {
  const childrenKey = childrenName || 'children';
  function loopHandle(dataItem) {
    if (!dataItem) return;
    const adapterResult = treeItemAdapter(dataItem);
    if (adapterResult) {
      Object.keys(adapterResult).forEach((tempKey) => {
        dataItem[tempKey] = adapterResult[tempKey];
      });
    }

    if (dataItem[childrenKey] && isArray(dataItem[childrenKey])) {
      dataItem[childrenKey].map((node) => {
        loopHandle(node);
      });
    }
  }

  treeList.forEach((dataItem) => {
    loopHandle(dataItem);
  });

  return treeList;
};
