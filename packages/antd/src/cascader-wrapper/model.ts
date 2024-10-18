import { API, ModelType } from '@dimjs/model';
import { Model } from '@dimjs/model-react';
import { TAny, TPlainObject } from '@hyperse/utils';
import { TRequestStatus } from '../request-status/request-status.js';

export type ModelState = {
  selectorList: TPlainObject[];
  queryIsEmpty: boolean;
  requestStatus: TRequestStatus;
};

type ModelActionParams = {
  setSelectBoxList: { selectorList: TPlainObject[] };
  changeRequestStatus: ModelState['requestStatus'];
};

const defaultState: ModelState = {
  selectorList: [],
  queryIsEmpty: false,
  requestStatus: 'request-init',
};

const _SelectorWrapperModel: ModelType<ModelState, ModelActionParams> = {
  actions: {
    setSelectBoxList: (params) => {
      return (state) => {
        state.selectorList = params.selectorList || [];
        state.requestStatus = 'request-success';
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

const cascaderWrapperModels: Record<
  string,
  API<ModelType<ModelState, ModelActionParams, TAny>>
> = {};

/**
 * ```
 * 使用方式
 * const [state, actions] = selectorWrapperModel('key值').useStore();
 * ```
 */
export const cascaderWrapperModel = (key: string) => {
  if (!cascaderWrapperModels[key]) {
    cascaderWrapperModels[key] = Model(_SelectorWrapperModel);
  }
  return cascaderWrapperModels[key];
};
