import { CSSProperties, ReactElement } from 'react';
import { classNames } from '@dimjs/utils';

export type RelationItemProps = {
  children: ReactElement | null | Array<ReactElement | null>;
  className?: string;
  style?: CSSProperties;
  isFirst?: boolean;
  isLast?: boolean;
  onlyOne?: boolean;
};

export const RelationItem = (props: RelationItemProps) => {
  const className = classNames('relation-item', {
    'relation-item-line': true,
    'relation-item-first': props.isFirst,
    'relation-item-last': props.isLast,
    'relation-item-only-one': props.onlyOne,
  });

  return (
    <div className={className} style={props.style}>
      {props.children}
    </div>
  );
};
