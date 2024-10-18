/**
 * 数组随机排序
 * @param array
 * @returns
 */
export const arrayRandomSort = <T>(array: T[]) => {
  return array.sort(() => {
    return Math.random() > 0.5 ? -1 : 1;
  });
};
