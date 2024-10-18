import { TPlainObject } from '@hyperse/utils';
import { createCtx } from '@wove/react';

export const [useLocalLoadingCtx, LocalLoadingCtxProvider] = createCtx<{
  onRequest: (params?: TPlainObject) => void;
}>();
