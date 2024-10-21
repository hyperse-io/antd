import { ReactElement } from 'react';
import { LayoutCtxProps } from '../types/layout.js';
import { BreadConfigItem } from '../types/route.js';
import { createCtx } from './create-ctx.js';

export const [useLayoutCtx, LayoutProvider] = createCtx<LayoutCtxProps>();
export const [bootstrapCtx, BootstrapCtx] = createCtx<{
  breads: BreadConfigItem[];
  breadTitle?: string | ReactElement;
  breadcrumbProps?: LayoutCtxProps['breadcrumbProps'];
}>();
