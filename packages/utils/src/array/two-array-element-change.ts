import { type TAny } from '../types/index.js';

/**
 * 两个数组中元素变换
 * ```
 * 1. sourceIndex、targetIndex超出长度，数组不做任何处理
 * ```
 */
export const twoArrayElementPositionChange = (
  sourceArray: TAny[],
  targetArray: TAny[],
  sourceIndex: number,
  targetIndex: number
) => {
  if (!sourceArray[sourceIndex]) {
    return {
      sourceArray,
      targetArray,
    };
  }
  targetArray.splice(targetIndex, 0, sourceArray[sourceIndex]);
  sourceArray.splice(sourceIndex, 1);
  return {
    sourceArray,
    targetArray,
  };
};
