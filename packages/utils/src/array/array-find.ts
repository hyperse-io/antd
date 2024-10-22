import { type TAny } from '../types/index.js';

/**
 * array.find严谨查询，使用 === 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayFind([1,2,3], 2) => 2
 * 2. arrayFind([{ age: 1, name: 'zhansan' }], 1, 'age') => { age: 1, name: 'zhansan' }
 * 3. arrayFind([{ age: 1, name: 'zhansan' }], '1', 'age', true) => { age: 1, name: 'zhansan' }
 * ```
 */
export const arrayFind = (
  dataList: TAny[],
  targetValue: string | number | boolean | undefined | null,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  if (!fieldName) {
    return dataListNew.find((item) => {
      return item === targetValue;
    });
  }
  return dataListNew.find((item) => {
    return item[fieldName] === targetValue;
  });
};

/**
 * array.find不严谨查询，使用 == 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayFindByLoosely([1,2,3], 2) => 2
 * 2. arrayFindByLoosely([{ age: 1, name: 'zhansan' }], 1, 'age') => { age: 1, name: 'zhansan' }
 * 3. arrayFindByLoosely([{ age: 1, name: 'zhansan' }], '1', 'age') => { age: 1, name: 'zhansan' }
 * ```
 */
export const arrayFindByLoosely = (
  dataList: TAny[],
  targetValue: string | number | boolean | undefined | null,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  if (!fieldName) {
    return dataListNew.find((item) => {
      return item == targetValue;
    });
  }
  return dataListNew.find((item) => {
    return item[fieldName] == targetValue;
  });
};
