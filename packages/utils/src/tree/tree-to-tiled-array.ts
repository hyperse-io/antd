import { extend } from '@dimjs/utils';
import { TAny, TPlainObject } from '../types/define.js';
import { TreeTiledDataItem } from '../types/index.js';

/**
 * 树结构数据，由嵌套结构转成平铺结构，返回数据格式根据fieldNames转换成 { value, label, parentValue }
 * @param dataList
 * @param fieldNames
 * @returns
 */
export const treeToTiledArray = (
  dataList: TPlainObject[],
  fieldNames?: { label?: string; value?: string; children?: string }
) => {
  const newFieldNames = extend(
    {},
    { label: 'label', value: 'value', children: 'children' },
    fieldNames
  );
  const labelKey = newFieldNames.label;
  const valueKey = newFieldNames.value;
  const childrenKey = newFieldNames.children;
  const tempList: Array<TreeTiledDataItem & { [key: string]: TAny }> = [];
  function parseChildren(nodeItem, parentValue) {
    tempList.push({
      ...nodeItem,
      label: nodeItem[labelKey],
      value: nodeItem[valueKey],
      parentValue,
    });
    if (nodeItem[childrenKey]) {
      nodeItem[childrenKey].map((node) => {
        parseChildren(node, nodeItem[valueKey]);
      });
    }
  }

  dataList.forEach((node) => {
    parseChildren(node, undefined);
  });

  return tempList;
};
