import { isUndefined } from '@dimjs/lang';
import { TAny } from '../types';

/**
 * 合并执行 originProps、patchProps中存在的相同命名函数，
 * @param originProps 原对象数据
 * @param patchProps 补丁对象数据
 * @param isMerge 是否浅合并对象，默认值：true
 * ```
 * 1. 主要用于 react 组件函数合并
 * ```
 */
export const composeProps = <
  T extends Record<string, TAny>,
  P extends Record<string, TAny>,
>(
  originProps: T,
  patchProps: P,
  isMerge?: boolean
) => {
  const isMergeNew = isUndefined(isMerge) ? true : isMerge;
  const composedProps: Record<string, TAny> = {
    ...originProps,
    ...(isMergeNew ? patchProps : {}),
  };

  Object.keys(patchProps).forEach((key) => {
    const func = patchProps[key];
    if (typeof func === 'function') {
      composedProps[key] = (...args: TAny[]) => {
        func(...args);
        return originProps[key]?.(...args);
      };
    }
  });
  return composedProps as T & P;
};
