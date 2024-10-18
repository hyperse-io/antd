import { createCtx } from '@wove/react';

export const [usePageWrapperCtx, PageWrapperCtxProvider] = createCtx<{
  onReload: () => void;
}>();
