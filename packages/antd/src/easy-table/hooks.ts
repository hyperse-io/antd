import { useContext } from 'react';
import { EasyTableContext } from './context.js';

/**
 * 在 EasyTable子组件内才可使用
 * @returns
 */
export const useEasyTable = () => {
  const ctx = useContext(EasyTableContext);
  return ctx.getEasyTableRef();
};
