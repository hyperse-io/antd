import { arrayRemove } from '@dimjs/utils';
import { type TAny } from '../types/index.js';

/**
 * 一维数组中两个元素交换位置
 * @param array
 * @param sourceIndex 来源索引
 * @param targetIndex 目标索引
 * ```
 * 1. sourceIndex、targetIndex超出array长度，数组不做任何处理
 * ```
 */
export const arrayReorder = (
  array: TAny[],
  sourceIndex: number,
  targetIndex: number
) => {
  const result = Array.from(array);
  if (sourceIndex > array.length - 1 || targetIndex > array.length - 1) {
    console.warn('指定交换索引值超出数组长度');
    return array;
  }
  //删除并记录 删除元素
  const [removed] = result.splice(sourceIndex, 1);
  //将原来的元素添加进数组
  result.splice(targetIndex, 0, removed);
  return result;
};

/**
 * 二维数组中的两个元素变更位置
 * @param arrays 二位数组
 * @param source 来源元素信息 index: 操作元素所有，parentIndex：操作元素的一维数组索引
 * @param target 目标元素信息 index: 操作元素所有，parentIndex：操作元素的一维数组索引
 * @returns
 */
export const arraysReorder = (
  arrays: TAny[][],
  source: { index: number; parentIndex: number },
  target: { index: number; parentIndex: number }
) => {
  const sourceItems = arrays[source.parentIndex];
  const sourceTarget = sourceItems[source.index];

  const sourceItemsNew = arrayRemove(sourceItems, sourceTarget);

  arrays[source.parentIndex] = sourceItemsNew;

  const targetItems = arrays[target.parentIndex];
  const newOverItems = [
    ...targetItems.slice(0, target.index),
    sourceTarget,
    ...targetItems.slice(target.index, targetItems.length),
  ];
  arrays[target.parentIndex] = newOverItems;

  return arrays;
};
