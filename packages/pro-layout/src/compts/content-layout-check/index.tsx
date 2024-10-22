import { type ReactElement } from 'react';
import { type BootstrapOptions } from '../../types/layout.js';
import { IframeTabMode } from './iframe-tab-mode.js';
import { NoLayoutMode } from './no-layout-mode.jsx';

type ContentLayoutCheckProps = {
  layoutMode?: BootstrapOptions['layoutMode'];
  children: ReactElement;
};

export const ContentLayoutCheck = (props: ContentLayoutCheckProps) => {
  if (props.layoutMode === 'iframe-tab') {
    return <IframeTabMode>{props.children}</IframeTabMode>;
  }
  if (props.layoutMode === 'no-layout') {
    return <NoLayoutMode>{props.children}</NoLayoutMode>;
  }
  return props.children;
};
