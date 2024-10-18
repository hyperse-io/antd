import { type TreeProps } from 'antd';
import { isArray } from '@dimjs/lang';
import { type API, type ModelType } from '@dimjs/model';
import { Model } from '@dimjs/model-react';
import {
  TAny,
  type TPlainObject,
  treeToArray,
  type TSetDefaultDefined,
} from '@hyperse/utils';
import { TRequestStatus } from '../request-status/index.js';

export type ModelState = {
  treeList: TSetDefaultDefined<TreeProps['treeData'], []>;
  treeTiledArray: TPlainObject[];
  queryIsEmpty: boolean;
  requestStatus?: TRequestStatus;
  requestErrorMessage?: string;
};

type ModelActionParams = {
  setTreeList: {
    treeList: ModelState['treeList'];
    childrenName: string;
  };
  resetTreeList: void;
  changeRequestStatus: {
    status: TRequestStatus;
    errorMessage?: string;
  };
  treeListAppendChildren: {
    value: string | number;
    appendList: TPlainObject[];
    childrenName: string;
    valueName: string;
  };
};

const defaultState: ModelState = {
  treeList: [],
  treeTiledArray: [],
  queryIsEmpty: false,
};

const TreeWrapperModel: ModelType<ModelState, ModelActionParams> = {
  actions: {
    setTreeList: (params) => {
      return (state) => {
        state.treeList = params.treeList || [];
        state.treeTiledArray = treeToArray(state.treeList, params.childrenName);
        state.requestStatus = 'request-success';
      };
    },
    resetTreeList: () => {
      return (state) => {
        state.treeList = [];
        state.treeTiledArray = [];
      };
    },
    changeRequestStatus: (params) => {
      return (state) => {
        state.requestStatus = params.status;
        if (params.status === 'request-error') {
          state.treeList = [];
          state.treeTiledArray = [];
          state.requestErrorMessage = params.errorMessage || '数据查询异常';
        } else {
          state.requestErrorMessage = undefined;
        }
      };
    },
    treeListAppendChildren: (params) => {
      return (state) => {
        const array = treeToArray(state.treeList, params.childrenName);
        const target = array.find(
          (item) => item[params.valueName] === params.value
        );
        if (target) {
          if (isArray(params.appendList) && params.appendList.length > 0) {
            target[params.childrenName] = params.appendList;
          } else {
            target.isLeaf = true;
          }
        }
        state.treeTiledArray = treeToArray(state.treeList, params.childrenName);
      };
    },
  },
  state: defaultState,
};

const treeWrapperModels: Record<
  string,
  API<ModelType<ModelState, ModelActionParams, TAny>>
> = {};

/**
 * ```
 * 使用方式
 * const [state, actions] = useTreeWrapperModel('key值').useStore();
 * ```
 */
export const treeWrapperModel = (key: string) => {
  if (!treeWrapperModels[key]) {
    treeWrapperModels[key] = Model(TreeWrapperModel);
  }
  return treeWrapperModels[key];
};
