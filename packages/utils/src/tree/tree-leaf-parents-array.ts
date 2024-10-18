import { get } from '@dimjs/utils';
import { isUndefinedOrNull } from '../lang';
import { TPlainObject } from '../types';

/**
 * 树叶子节点的所有父节点列表
 * @param value 叶子结点value
 * @param treeTiledList 平铺树结构，可通过treeToArray 将tree数据转为tree平铺数据
 * @param hasSelf 返回是否包含叶子节点，默认值：false
 * @param fieldNames 字段配置，默认值 { value: 'value', parentValue: 'parentValue' }
 * ```
 * fieldNames.parentValue 可传多级，例如: 'parent.id'
 * ```
 */
export const treeLeafParentsArray = (
  value: string | number,
  treeTiledList: TPlainObject[],
  hasSelf = false,
  fieldNames?: { value: string; parentValue: string }
) => {
  const newFieldNames = {
    value: 'value',
    parentValue: 'parentValue',
    ...fieldNames,
  };
  const tempList: TPlainObject[] = [];
  function parseChildren(itemValue: string | number) {
    const target = treeTiledList.find(
      (temp) => temp[newFieldNames.value] === itemValue
    );
    if (target) {
      tempList.push(target);
      const parentValue = get(target, newFieldNames.parentValue);
      if (!isUndefinedOrNull(parentValue)) {
        parseChildren(parentValue);
      }
    }
  }
  parseChildren(value);
  if (!hasSelf) {
    if (tempList.length > 1) {
      return tempList.splice(1, tempList.length - 1);
    }
    return [];
  }
  return tempList.reverse();
};
