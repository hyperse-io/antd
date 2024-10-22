import { type TPlainObject } from '@hyperse/utils';
import { createCtx } from '@wove/react';

export const [useFbaAppDialogModalCtx, CtxProvider] = createCtx<{
  /** 重新渲染footer */
  rerenderFooter: (data?: TPlainObject) => void;
}>();
