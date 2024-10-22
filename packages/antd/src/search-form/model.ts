import { type API, type ModelType } from '@dimjs/model';
import { Model } from '@dimjs/model-react';
import { type TAny, type TPlainObject } from '@hyperse/utils';

export type ModelState = {
  queryCondition: TPlainObject;
  isInit: boolean;
  openFold: boolean;
};

type ModelActionParams = {
  updateFilterCondition?: Partial<ModelState['queryCondition']>;
  resetFilterCondition?: TPlainObject;
  updateInitStatus: void;
  onChangeOpenFold: boolean;
};

const defaultState: ModelState = {
  queryCondition: {},
  isInit: true,
  openFold: false,
};

const SearchFormModel: ModelType<ModelState, ModelActionParams> = {
  actions: {
    updateFilterCondition: (params) => {
      return (state) => {
        state.queryCondition = {
          ...state.queryCondition,
          ...params,
        };
      };
    },
    resetFilterCondition: (params) => {
      return (state) => {
        state.queryCondition = {
          ...defaultState.queryCondition,
          ...params,
        };
      };
    },
    updateInitStatus: () => {
      return (state) => {
        state.isInit = false;
      };
    },
    onChangeOpenFold: (boo) => {
      return (state) => {
        state.openFold = boo;
      };
    },
  },
  state: defaultState,
};

const searchFormModels: Record<
  string,
  API<ModelType<ModelState, ModelActionParams, TAny>>
> = {};

/**
 * ```
 * 使用方式
 * const [state, actions] = selectorWrapperModel('key值').useStore();
 * ```
 */
export const searchFormModel = (key: string) => {
  if (!searchFormModels[key]) {
    searchFormModels[key] = Model(SearchFormModel);
  }
  return searchFormModels[key];
};
