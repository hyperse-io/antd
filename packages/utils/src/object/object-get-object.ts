import { TPlainObject } from '../types/index.js';

/**
 * 从对象数据中，根据规则筛选对象
 * @param data
 * @param keyList
 * @returns
 *
 */
export const objectGetObject = (
  objectData?: TPlainObject,
  keyList?: Array<string | { beforeKey: string; afterKey: string }>
) => {
  if (!objectData || !keyList || !keyList.length) return {};
  const result = {} as TPlainObject;

  keyList.forEach((temp) => {
    const targetKey = typeof temp === 'string' ? temp : temp.beforeKey;
    const resultKey = typeof temp === 'string' ? temp : temp.afterKey;
    const objectKeys = Object.keys(objectData);
    if (objectKeys.includes(targetKey) && resultKey) {
      result[resultKey] = objectData[targetKey];
    }
  });

  return result;
};
