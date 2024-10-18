import { isObject } from '@dimjs/lang';
import { toArray } from '@hyperse/utils';

/**
 *  value存在两种格式
 * 1. string | number;
 * 2. labelInValue 格式
 * @param data
 * @param labelInValueFieldNames
 * @returns
 */
export const getVauleList = (data, valueKey: string | number) => {
  let valueList = toArray<string | number>(data);
  valueList = valueList.map((item) => {
    if (isObject(item)) return item[valueKey];
    return item;
  });
  return valueList;
};
