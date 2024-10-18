import { type TPlainObject } from '@hyperse/utils';
import { treeWrapperModel } from './model.js';

export const getTreeDataList = (modelKey: string) => {
  const state = treeWrapperModel(modelKey).getState();
  return state.treeList as TPlainObject[];
};
