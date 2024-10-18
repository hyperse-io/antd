import { ReactElement } from 'react';
import { LayoutCtxProps } from '../types/layout';
import { BreadConfigItem } from '../types/route';
import { createCtx } from './create-ctx';

export const [useLayoutCtx, LayoutProvider] = createCtx<LayoutCtxProps>();
export const [bootstrapCtx, BootstrapCtx] = createCtx<{
  breads: BreadConfigItem[];
  breadTitle?: string | ReactElement;
  breadcrumbProps?: LayoutCtxProps['breadcrumbProps'];
}>();
