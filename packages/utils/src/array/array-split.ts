import { TAny } from '../types';

/**
 * 分割数组
 * @param array
 * @param length 分割长度
 * @returns
 */
export const arraySplit = (array: TAny[], length: number) => {
  if (length <= 0) return [];
  let index = 0;
  const newArray: TAny[][] = [];
  while (index < array.length) {
    newArray.push(array.slice(index, (index += length)));
  }
  return newArray;
};
