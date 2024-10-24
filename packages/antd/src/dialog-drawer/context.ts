import { type CSSProperties } from 'react';
import { type TPlainObject } from '@hyperse/utils';
import { createCtx } from '@wove/react';

export const [useDialogDrawerCtx, CtxProvider] = createCtx<{
  onClose: () => void;
  updateBodyStyle: (style?: CSSProperties) => void;
  /** 重新渲染footer */
  rerenderFooter: (data?: TPlainObject) => void;
}>();
