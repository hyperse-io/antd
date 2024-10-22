import { type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { attachPropertiesToComponent, type TPlainObject } from '@hyperse/utils';
import { getTreeDataList } from './hooks.js';
import {
  TreeWrapper as TreeWrapperInner,
  type TreeWrapperProps,
  type TreeWrapperRefApi,
} from './tree-wrapper.jsx';
/**
 * Tree包装组件，默认返回父节点，可配置不返回
 * @param props
 * @returns
 * ```
 * 1. treeNode内置字段说明（如需要相关功能，可在接口中添加固定字段）
 *    a. disabled 禁掉响应
 *    b. isLeaf  设置为叶子节点 (设置了 loadData 时有效)。为 false 时会强制将其作为父节点
 *    c. disableCheckbox  checkable模式下，treeNode复选框是否可选
 * 2. 当设置selectorTreeList属性后，serviceConfig将失效
 * 3. checkable=true，为多选模式
 * 4. 设置value后，组件显示受控
 * 5. 设置loadDataFlag=true，会动态获取children，当treeNode中包含isLeaf=true字段，表示为叶子节点，没有children了
 * 6. 内置 onDrop 事件已处理数组排序，通过 onDropNodeHandle 事件可获取操作节点排序数据；自定义onDrop后，内置onDrop失效
 * ```
 */
export const TreeWrapper: ForwardRefExoticComponent<
  TreeWrapperProps & RefAttributes<TreeWrapperRefApi>
> & {
  getTreeDataList: (modelKey: string) => TPlainObject[];
} = attachPropertiesToComponent(TreeWrapperInner, {
  /**
   * 获取树形原数据
   * ```
   * 参数 modelKey 与 TreeWrapper属性 modelKey相同，才能获取数据
   * ```
   */
  getTreeDataList: getTreeDataList,
});
