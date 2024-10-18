import { useRef } from 'react';
import { useSize } from 'ahooks';
import { Tooltip } from 'antd';
import { classNames } from '@dimjs/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import { TextOverflowProps } from './types.js';
import './style.less';

export const OverflowAuto = (props: TextOverflowProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const size = useSize(rootRef);
  const parentNodeWidth = size?.width || 0;
  const hideTextRef = useRef<HTMLSpanElement>(null);

  const hideTextSize = useSize(hideTextRef);

  // 文本宽度
  const showTips = fbaHooks.useMemoCustom(() => {
    if (!hideTextSize?.width || !parentNodeWidth) return false;
    return hideTextSize.width > parentNodeWidth;
  }, [hideTextSize?.width, parentNodeWidth]);

  return (
    <div
      className={classNames('text-overflow', {
        'tow-trigger': props.onClick,
      })}
      ref={rootRef}
    >
      <span className="tow-hidden">
        <span className="tow-inner-text" ref={hideTextRef}>
          {props.text}
        </span>
      </span>
      <Tooltip title={showTips ? props.text : undefined}>
        <span className="tow-content">
          <span className="tow-show-text" onClick={props.onClick}>
            {props.text}
          </span>
        </span>
      </Tooltip>
    </div>
  );
};
