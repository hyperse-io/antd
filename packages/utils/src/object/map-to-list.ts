import { TAny } from '../types';

export type MapToListDefaultItem<V> = { label: string; value: V };

/**
 * 对象转数组（精确）
 * @param mapData map对象
 * @param valueList value数组
 * @param labelName 自定义map key值属性名称，默认：value
 * @param valueName 自定义map value值属性名称，默认：label
 * @returns
 * ```
 * 由于map对象再获取key列表时，都是字符串类型数组，无法精确获取key类型，所以通过valueList来获取key的精确类型
 * const adminTypeMap = {
 *    1:'superAdmin',
 *    2:'generalAdmin',
 * }
 * mapToListExact<MapToListDefaultItem<number>>(adminTypeMap, [1,2])
 * =>
 * 默认值转出格式
 * [{ label: 'superAdmin', value: 1 },{ label: 'generalAdmin', value: 2 }]
 * ```
 */
export const mapToListExact = <T extends object>(
  mapData: Record<string, unknown>,
  valueList: Array<string | number>,
  labelName = 'label',
  valueName = 'value',
  colorMap?: Record<string | number, string>
) => {
  const tempList: Array<TAny> = [];
  valueList.map((value) => {
    tempList.push({
      [labelName]: mapData[value as string],
      [valueName]: value,
      color: colorMap?.[value],
    });
  });
  return tempList as T[];
};

/**
 * 对象转数组（非精确转换，精确转换使用mapToListExact）
 * @param map 对象
 * @param labelName 自定义map key值属性名称，默认：value
 * @param valueName 自定义map value值属性名称，默认：label
 * @returns
 * ```
 * 例如
 * const adminType = {
 *    1:'superAdmin',
 *    2:'generalAdmin',
 * }
 * mapToListExact<MapToListDefaultItem<number>>(adminType, [1,2])
 * =>
 * 默认值转出格式
 * [{ label: 'superAdmin', value: '1' },{ label: 'generalAdmin', value: '2' }]
 * ```
 */
export const mapToList = <T extends object>(
  map: Record<string, unknown>,
  labelName = 'label',
  valueName = 'value'
) => {
  const list: Array<TAny> = [];
  Object.keys(map).forEach((key) => {
    const obj = {
      [labelName]: map[key],
      [valueName]: key,
    };
    list.push(obj);
  });
  return list as T[];
};
