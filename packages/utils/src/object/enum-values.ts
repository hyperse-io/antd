/**
 * 获取枚举类型 value 数组
 * @param enumeration 枚举类型
 * @returns
 * ```
 * 例如：
 * enum AdminTypeEnum {
 *  superAdmin = 1,
 *  generalAdmin = 0,
 * }
 * =>
 * [1,0]
 * ```
 */
export const enumValues = <T extends object>(
  enumeration: T
): Array<T[keyof T]> => {
  const keys = Object.keys(enumeration).filter((k) => isNaN(Number(k)));

  return keys.map((k) => enumeration[k]) as Array<T[keyof T]>;
};
