import { type API, type ModelType } from '@dimjs/model';
import { Model } from '@dimjs/model-react';
import { type TAny, type TPlainObject } from '@hyperse/utils';

export type ModelState = {
  queryCondition: TPlainObject;
  isInit: boolean;
};

type ModelActionParams = {
  updateFilterCondition?: Partial<ModelState['queryCondition']>;
  resetFilterCondition?: TPlainObject;
  updateInitStatus: void;
};

const defaultState: ModelState = {
  queryCondition: {},
  isInit: true,
};

const _EasyTableModel: ModelType<ModelState, ModelActionParams> = {
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
  },
  state: defaultState,
};

const easyTableModels: Record<
  string,
  API<ModelType<ModelState, ModelActionParams, TAny>>
> = {};

/**
 * ```
 * 使用方式
 * const [state, actions] = selectorWrapperModel('key值').useStore();
 * ```
 */
export const easyTableModel = (key: string) => {
  if (!easyTableModels[key]) {
    easyTableModels[key] = Model(_EasyTableModel);
  }
  return easyTableModels[key];
};
