import { type CSSProperties, type ReactNode } from 'react';
import { classNames } from '@dimjs/utils';
import './style.less';

export type PageFixedFooterProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode | ReactNode[];
  hidden?: boolean;
};

export const PageFixedFooter = (props: PageFixedFooterProps) => {
  if (props.hidden) {
    return null;
  }
  return (
    <div
      className={classNames('page-fixed-footer', props.className)}
      style={props.style}
    >
      {props.children}
    </div>
  );
};
