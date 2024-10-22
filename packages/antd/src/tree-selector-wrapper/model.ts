import { type TreeSelectProps } from 'antd';
import { type API, type ModelType } from '@dimjs/model';
import { Model } from '@dimjs/model-react';
import {
  type TAny,
  type TPlainObject,
  type TSetDefaultDefined,
} from '@hyperse/utils';
import { type TRequestStatus } from '../request-status/index.js';

export type ModelState = {
  treeSelectorList: TSetDefaultDefined<TreeSelectProps['treeData'], []>;
  treeSelectorTiledArray: TPlainObject[];
  queryIsEmpty: boolean;
  requestStatus?: TRequestStatus;
};

type ModelActionParams = {
  setSelectBoxList: {
    treeSelectorList: ModelState['treeSelectorList'];
    treeSelectorTiledArray: ModelState['treeSelectorTiledArray'];
  };
  resetSelectBoxList: void;
  changeRequestStatus: TRequestStatus;
};

const defaultState: ModelState = {
  treeSelectorList: [],
  treeSelectorTiledArray: [],
  queryIsEmpty: false,
};

const TreeSelectorWrapperModel: ModelType<ModelState, ModelActionParams> = {
  actions: {
    setSelectBoxList: (params) => {
      return (state) => {
        state.treeSelectorList = params.treeSelectorList || [];
        state.treeSelectorTiledArray = params.treeSelectorTiledArray || [];
        state.requestStatus = 'request-success';
      };
    },
    resetSelectBoxList: () => {
      return (state) => {
        state.treeSelectorList = [];
      };
    },
    changeRequestStatus: (params) => {
      return (state) => {
        state.requestStatus = params;
      };
    },
  },
  state: defaultState,
};

const treeSelectorWrapperModels: Record<
  string,
  API<ModelType<ModelState, ModelActionParams, TAny>>
> = {};

/**
 * ```
 * 使用方式
 * const [state, actions] = useTreeSelectorWrapperModel('key值').useStore();
 * ```
 */
export const treeSelectorWrapperModel = (key: string) => {
  if (!treeSelectorWrapperModels[key]) {
    treeSelectorWrapperModels[key] = Model(TreeSelectorWrapperModel);
  }
  return treeSelectorWrapperModels[key];
};
