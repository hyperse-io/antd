import { TAny } from '../types';

/**
 * array.filter严谨查询，使用 === 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * @returns
 * ```
 * 例如：
 * 1. arrayFilter([1,2,3], 2) => [2]
 * 2. arrayFilter([{ age: 1, name: 'zhansan' },{ age: 2, name: 'lisi' },{ age: 3, name: 'wangwu' }], 2, 'age') => [{ age: 2,name: 'lisi' }]
 * ```
 */
export const arrayFilter = (
  dataList: TAny[],
  targetValue: string | number | boolean | undefined | null,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  if (!fieldName) {
    return dataListNew.filter((item) => {
      return item === targetValue;
    });
  }
  return dataListNew.filter((item) => {
    return item?.[fieldName] === targetValue;
  });
};

/**
 * array.filter不严谨查询，使用 == 进行比较
 * @param array
 * @param targetValue
 * @param fieldName 如果数组元素是对象，则为查找对象元素key值
 * ```
 * 例如：
 * 1. arrayFilterByLoosely([1,2,3], 2) => 2
 * 2. arrayFilterByLoosely([{ age: 1, name: 'zhansan' }], 1, 'age') => { age: 1, name: 'zhansan' }
 * 3. arrayFilterByLoosely([{ age: 1, name: 'zhansan' }], '1', 'age') => { age: 1, name: 'zhansan' }
 * ```
 */
export const arrayFilterByLoosely = (
  dataList: TAny[],
  targetValue: string | number | boolean | undefined | null,
  fieldName?: string
) => {
  const dataListNew = dataList || [];
  if (!fieldName) {
    return dataListNew.filter((item) => {
      return item == targetValue;
    });
  }
  return dataListNew.filter((item) => {
    return item?.[fieldName] == targetValue;
  });
};
