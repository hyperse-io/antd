import { type ModelType } from '@dimjs/model';
import { Model } from '@dimjs/model-react';

type IState = {
  isDark?: boolean;
};

type ActionParams = {
  onSetTheme: 'dark' | 'light';
};

const defaultState: IState = {
  isDark: undefined,
};

export const ProLayoutModel: ModelType<IState, ActionParams> = {
  actions: {
    onSetTheme: async (theme) => {
      return (state) => {
        state.isDark = theme === 'dark';
      };
    },
  },
  state: defaultState,
};

export const proLayoutModels = Model({ ProLayoutModel });
