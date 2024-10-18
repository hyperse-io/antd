import { isUndefined } from '@dimjs/lang';
import { toArray } from '../array/to-array';
import { TPlainObject } from '../types';
import { treeToArray } from './tree-to-array';

const own = {}.hasOwnProperty;
const treeFilterInner = <T>(
  tree: TPlainObject,
  test: (
    node: TPlainObject,
    index?: number,
    parent?: TPlainObject,
    level?: number
  ) => boolean,
  fieldNames: { children: string }
) => {
  return preorder(tree);

  /**
   * @param {T} node
   * @param {number|undefined} [index]
   * @param {Parent|undefined} [parent]
   * @param {number|undefined} [level]
   * @returns {T|null}
   */
  function preorder(
    node: TPlainObject,
    index?: number,
    parent?: TPlainObject,
    level = 0
  ): TPlainObject | null {
    const children: T[] = [];
    let result;
    let key: string;
    let childIndex: number;

    const testResult = test(node, index, parent, level);
    if (!testResult) return null;

    if (node[fieldNames.children]) {
      childIndex = -1;
      level++;
      // Looks like a parent.
      while (++childIndex < node[fieldNames.children].length) {
        //Looks like a parent.
        result = preorder(
          node[fieldNames.children][childIndex],
          childIndex,
          node,
          level
        );

        if (result) {
          children.push(result);
        }
      }

      // Looks like a parent.
      // if (options.cascade && node.children.length && !children.length) return null;
    }

    // Create a shallow clone, using the new children.
    // all the fields will be copied over.
    const next = {};

    for (key in node) {
      /* istanbul ignore else - Prototype injection. */
      if (own.call(node, key)) {
        next[key] = key === fieldNames.children ? children : node[key];
      }
    }

    return next;
  }
};

/**
 * 根据规则过滤tree数据
 * @param dataList tree 数据
 * @param filter 过滤条件
 * @param options 配置项
 *
 * ```
 *  options配置项目中
 * 1. options.childrenName（tree数据数组节点key字段名称）
 *    默认值：children
 * 2. options.queryParentShowChildrenAll（过滤匹配到父节点是否显示全部子节点）
 *    默认值：true
 * ```
 */
export const treeFilter = (
  dataList: TPlainObject[],
  filter: (node) => boolean,
  options?: {
    childrenName?: string;
    /** 过滤匹配到父节点是否显示全部子节点，默认：true */
    queryParentShowChildrenAll?: boolean;
  }
) => {
  const childrenName = options?.childrenName || 'children';
  const deleteKey = '___delete';
  const queryParentShowChildrenAll = isUndefined(
    options?.queryParentShowChildrenAll
  )
    ? true
    : options?.queryParentShowChildrenAll;

  const loop = function (treeItem: TPlainObject) {
    if (filter(treeItem) && queryParentShowChildrenAll) {
      return;
    }
    if (toArray(treeItem[childrenName]).length > 0) {
      const tileArray = treeToArray(treeItem[childrenName], childrenName);
      const target = tileArray.find((item) => filter(item));
      if (!target) {
        const target = filter(treeItem);
        if (!target) {
          treeItem[deleteKey] = true;
        }
        treeItem[childrenName].forEach((item) => {
          item[deleteKey] = true;
        });
      } else {
        for (let index = 0; index < treeItem[childrenName].length; index++) {
          const element = treeItem[childrenName][index];
          loop(element);
        }
      }
    } else {
      const target = filter(treeItem);
      if (!target) {
        treeItem[deleteKey] = true;
      }
    }
  };

  for (let index = 0; index < dataList.length; index++) {
    const element = dataList[index];
    loop(element);
  }
  const resultList: Array<TPlainObject | null> = [];
  for (let index = 0; index < dataList.length; index++) {
    const element = dataList[index];
    resultList.push(
      treeFilterInner(
        element,
        (node) => {
          return !node[deleteKey];
        },
        { children: childrenName }
      )
    );
  }

  return resultList.filter(Boolean);
};
