import { TPlainObject } from '../types/define';

/**
 * 树结构数据，由嵌套结构转成平铺结构，返回值不改变原数据命名
 * @param dataList
 * @param childrenName
 * @returns
 */
export const treeToArray = (dataList: TPlainObject[], childrenName: string) => {
  const tempList: TPlainObject[] = [];
  function parseChildren(nodeItem) {
    tempList.push(nodeItem);
    if (nodeItem[childrenName]) {
      nodeItem[childrenName].map((node) => {
        parseChildren(node);
      });
    }
  }

  dataList.forEach((node) => {
    parseChildren(node);
  });
  return tempList;
};
