import { type ReactElement } from 'react';
import { createCtx } from '@wove/react';

export const [getCtx, CtxProvider] = createCtx<{
  dragIcon?: ReactElement;
  uidFieldKey: string;
}>();
