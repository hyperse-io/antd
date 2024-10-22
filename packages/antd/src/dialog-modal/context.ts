import { type TPlainObject } from '@hyperse/utils';
import { createCtx } from '@wove/react';

export const [useDialogModalCtx, DialogModalCtxProvider] = createCtx<{
  /** 重新渲染footer */
  rerenderFooter: (data?: TPlainObject) => void;
}>();
