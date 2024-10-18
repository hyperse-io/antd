import { DependencyList, useEffect } from 'react';

export const useEffectCustomAsync = (
  fn: () => Promise<void>,
  deps: DependencyList
) => {
  useEffect(() => {
    async function asyncFunction() {
      await fn();
    }
    void asyncFunction();
  }, deps);
};
