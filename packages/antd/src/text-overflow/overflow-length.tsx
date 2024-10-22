import { useRef } from 'react';
import { useSize } from 'ahooks';
import { Tooltip } from 'antd';
import { classNames } from '@dimjs/utils';
import { type TextOverflowProps } from './types.js';

export const OverflowLength = (props: Omit<TextOverflowProps, 'maxWidth'>) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const size = useSize(rootRef);
  const maxLength = props.maxLength as number;
  const parentNodeWidth = size?.width || 0;
  const text = props.text as string;
  const hideTextRef = useRef<HTMLSpanElement>(null);

  const hideTextSize = useSize(hideTextRef);
  const needCut = text.length > maxLength;

  const cutedTextWidth = hideTextSize?.width || 0;

  const showCustomEllipsis = needCut && cutedTextWidth < parentNodeWidth;

  const showTips = parentNodeWidth < cutedTextWidth + 1 || needCut;

  const cutValue = text.substring(0, props.maxLength);

  return (
    <div
      className={classNames('text-overflow', {
        'tow-trigger': props.onClick,
      })}
      ref={rootRef}
    >
      <span className="tow-hidden">
        <span className="tow-inner-text" ref={hideTextRef}>
          {cutValue}
        </span>
      </span>

      <Tooltip title={showTips ? text : undefined}>
        {showCustomEllipsis ? (
          <span className="tow-cut-content">
            <span className="tow-show-text" onClick={props.onClick}>
              {cutValue}...
            </span>
          </span>
        ) : (
          <span className="tow-content">
            <span className="tow-show-text" onClick={props.onClick}>
              {text}
            </span>
          </span>
        )}
      </Tooltip>
    </div>
  );
};
