import { type DependencyList, type EffectCallback, useEffect } from 'react';

export const useEffectCustom = (fn: EffectCallback, deps: DependencyList) => {
  return useEffect(fn, deps);
};
