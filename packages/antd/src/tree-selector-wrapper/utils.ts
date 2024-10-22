import { type TreeSelectProps } from 'antd';
import { dequal } from 'dequal';
import { isArray, isObject } from '@dimjs/lang';
import {
  isUndefinedOrNull,
  type LabelValueItem,
  toArray,
  type TPlainObject,
  treeLeafParentsArray,
  treeToTiledArray,
} from '@hyperse/utils';

export const getExpandedKeys = (
  value: string | number,
  treeList: TPlainObject[],
  fieldNames?: TreeSelectProps['fieldNames']
) => {
  if (!isArray(treeList) || treeList.length === 0) return [];
  const tiledArray = treeToTiledArray(treeList, fieldNames);
  return treeLeafParentsArray(value, tiledArray, true, {
    value: 'value',
    parentValue: 'parentValue',
  });
};

export const getVauleList = (data, fieldNames: LabelValueItem<string>) => {
  let tempList = toArray<TPlainObject | string | number>(data);
  tempList = tempList.map((item) => {
    if (isObject(item)) return item[fieldNames.value];
    return item;
  });
  return tempList as Array<string | number>;
};

export const array2map = (data, fieldNames: LabelValueItem<string>) => {
  const list = getVauleList(data, fieldNames);
  const map = {};
  list.forEach((item) => {
    map[item] = true;
  });
  return map;
};

/**
 * value的类型包括 string、number、Array<string | number>、{ label: string, value: string | nuber }
 * 将数组转成对象，深度比较时不用考虑顺序问题
 * @param value1
 * @param value2
 * @returns
 */
export const treeSelectorWrapperValueDeepEqual = (
  value1: any,
  value2: any,
  fieldNames: LabelValueItem<string>
) => {
  if (isUndefinedOrNull(value1) && isUndefinedOrNull(value2)) return true;
  const object1 = array2map(value1, fieldNames);
  const object2 = array2map(value2, fieldNames);
  const diff = dequal(object1, object2);
  return diff;
};
