import { TAny } from '../types/index.js';

/**
 * array.findIndex严谨查询，使用 === 进行比较
 * ```
 * 使用 === 进行比较
 * ```
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayFindIndex([1,2,3], 2) => 2
 * 2. arrayFindIndex([{ age: 1, name: 'zhansan' }], 1, 'age') => { age: 1, name: 'zhansan' }
 * 3. arrayFindIndex([{ age: 1, name: 'zhansan' }], '1', 'age', true) => { age: 1, name: 'zhansan' }
 * ```
 */
export const arrayFindIndex = (
  dataList: TAny[],
  targetValue: string | number | boolean | undefined | null,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  if (!fieldName) {
    return dataListNew.findIndex((item) => {
      return item === targetValue;
    });
  }
  return dataListNew.findIndex((item) => {
    return item[fieldName] === targetValue;
  });
};

/**
 * array.findIndex不严谨查询，使用 == 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayFindIndex([1,2,3], 2) => 2
 * 2. arrayFindIndex([{ age: 1, name: 'zhansan' }], 1, 'age') => { age: 1, name: 'zhansan' }
 * 3. arrayFindIndex([{ age: 1, name: 'zhansan' }], '1', 'age', true) => { age: 1, name: 'zhansan' }
 * ```
 */
export const arrayFindIndexByLoosely = (
  dataList: TAny[],
  targetValue: string | number | boolean | undefined | null,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  if (!fieldName) {
    return dataListNew.findIndex((item) => {
      return item == targetValue;
    });
  }
  return dataListNew.findIndex((item) => {
    return item[fieldName] == targetValue;
  });
};
