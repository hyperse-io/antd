import { TPlainObject } from '@hyperse/utils';
import { createCtx } from '@wove/react';

export const [useFbaAppDialogDrawerCtx, CtxProvider] = createCtx<{
  /** 重新渲染footer */
  rerenderFooter: (data?: TPlainObject) => void;
}>();
