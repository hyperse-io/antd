import { type CSSProperties } from 'react';
import { Tag } from 'antd';
import { classNames } from '@dimjs/utils';
import { type RelationProps } from '../type.js';

export const Relation = (props: RelationProps) => {
  const style = {
    '--relation-tagline-width': `${props.tagLineWidth || 40}px`,
    '--relation-group-indent-width': `${props.indentWidth || 80}px`,
    '--relation-tag-width': `${props.tagWidth || 26}px`,
    '--relation-line-color': `${props.lineColor || '#fda148'}`,
  } as CSSProperties;

  const className = classNames(
    'relation-list',
    {
      'relation-list-only-one': props.onlyOne,
      'relation-list-only-no-main-one': props.onlyOne,
    },
    props.className
  );
  const { solt1, solt2 } = props;

  return (
    <div className={className} style={style}>
      {solt1 ? (
        <div className="relation-list-solt1">
          <div className="relation-list-line"></div>
          <div className="relation-list-label">{props.label}</div>

          {props.tagName ? (
            <Tag
              className="relation-item-tag"
              color={props.tagColor || '#fecd96'}
              onClick={props.onTagClick?.bind(null, props.tagName)}
            >
              {props.tagName}
            </Tag>
          ) : null}
          {solt1()}
        </div>
      ) : null}
      {solt2 ? <div className="relation-list-solt2">{solt2()}</div> : null}
    </div>
  );
};
