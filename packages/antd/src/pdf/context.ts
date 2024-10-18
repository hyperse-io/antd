import { createCtx } from '@wove/react';

type CtxProps = {
  getPdfInstance: () => any;
};

export const [getCtx, CtxProvider] = createCtx<CtxProps>();
