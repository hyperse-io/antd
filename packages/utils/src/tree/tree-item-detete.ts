import { TPlainObject } from '../types';
import { treeFilter } from './tree-filter';
import { treeToArray } from './tree-to-array';

/**
 * 根据key值 删除 Tree数据节点以及所有子节点
 * @param key 待删除节点 key
 * @param treeList tree 数据
 * @param options tree 数据字段名称配置
 *
 */
export const treeItemDelete = (
  key: string | number,
  treeList: TPlainObject[],
  options: { key: string; children: string }
) => {
  const keyName = options.key;
  const childrenName = options.children;
  const tirdList = treeToArray(treeList, childrenName);
  const target = tirdList.find((item) => item[keyName] === key);
  if (!target) {
    console.warn('未查询到需要删除的元素');
    return treeList;
  }
  const targetList = (
    target?.[childrenName]
      ? treeToArray(target[childrenName], childrenName)
      : []
  ).concat(target);
  const filterList = treeFilter(
    treeList,
    (node) => {
      return !targetList.find((item) => item[keyName] === node[keyName]);
    },
    { queryParentShowChildrenAll: false }
  );
  return filterList;
};
