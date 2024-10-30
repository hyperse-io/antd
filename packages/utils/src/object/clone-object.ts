/**
 * 深拷贝对象，对象中只能存在 JSON 支持的类型
 * ```
 * 例如
 * 1. cloneObject({ x: 1 })
 * 2. cloneObject([{ x: 1 }])
 * ```
 */
export const cloneObject = <T>(obj: T): T => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj)) as T;
};
