/**
 * 树结构类型
 */
export type TreeDataItem<T extends string | number = string> = {
  value: T;
  label: string;
  children: TreeDataItem<T>;
};

/**
 *  树平铺结构类型
 */
export type TreeTiledDataItem<T extends string | number = string | number> = {
  value: T;
  label: string;
  parentValue?: T;
};
