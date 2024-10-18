import { type DependencyList, useMemo } from 'react';
/**
 * 自定义控制 useMemo 依赖
 */
export const useMemoCustom = <T>(fn: () => T, deps: DependencyList) => {
  return useMemo<T>(fn, deps);
};
