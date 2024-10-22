import { type ReactElement } from 'react';
import { classNames } from '@dimjs/utils';

export type RelationGroupListProps = {
  children: ReactElement | ReactElement[] | null;
  className?: string;
};

export const RelationGroupList = (props: RelationGroupListProps) => {
  return (
    <div className={classNames('relation-group-list', props.className)}>
      {props.children}
    </div>
  );
};
