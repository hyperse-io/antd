import { ReactElement } from 'react';
import { BootstrapOptions } from '../../types';
import { IframeTabMode } from './iframe-tab-mode';
import { NoLayoutMode } from './no-layout-mode';

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
