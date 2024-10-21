import { TAny } from '../types/index.js';
import { arrayFilter, arrayFilterByLoosely } from './array-filter.js';

/**
 * 严谨查询，使用 === 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayFind([1,2,3], 2) => 2
 * 2. arrayFind([{ age: 1, name: 'zhansan' }], 1, 'age') => [{ age: 1, name: 'zhansan' }]
 * 3. arrayFind([{ age: 1, name: 'zhansan' }], '1', 'age') => [{ age: 1, name: 'zhansan' }]
 * ```
 */
export const arrayPick = (
  dataList: TAny[],
  targetValue: Array<string | number | boolean>,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  let result = [] as TAny[];
  targetValue.forEach((value) => {
    const target = arrayFilter(dataListNew, value, fieldName);
    if (target) {
      result = result.concat(target);
    }
  });
  return result;
};

/**
 * 不严谨查询，使用 == 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayPickByLoosely([1,2,3], [2]) => [2]
 * 2. arrayPickByLoosely([{ age: 1, name: 'zhansan' }], [1], 'age') => [{ age: 1, name: 'zhansan' }]
 * 3. arrayPickByLoosely([{ age: 1, name: 'zhansan' }], ['1'], 'age') => [{ age: 1, name: 'zhansan' }]
 * ```
 */
export const arrayPickByLoosely = (
  dataList: TAny[],
  targetValue: Array<string | number | boolean>,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  let result = [] as TAny[];
  targetValue.forEach((value) => {
    const target = arrayFilterByLoosely(dataListNew, value, fieldName);
    if (target) {
      result = result.concat(target);
    }
  });
  return result;
};
