import { useMemo, useRef } from 'react';
import { useSize } from 'ahooks';
import { Tooltip } from 'antd';
import { classNames } from '@dimjs/utils';
import { type TextOverflowProps } from './types.js';

export const OverflowWidth = (props: Omit<TextOverflowProps, 'maxLength'>) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const rootSize = useSize(rootRef);
  const maxWidth = props.maxWidth || 0;
  const hideTextRef = useRef<HTMLSpanElement>(null);

  const hideTextSize = useSize(hideTextRef);

  const handleResult = useMemo(() => {
    if (!hideTextSize?.width || !rootSize?.width) return undefined;
    if (rootSize.width < maxWidth) {
      if (hideTextSize.width > rootSize.width) {
        return { showTips: true };
      }
    }
    if (hideTextSize.width < maxWidth) return undefined;
    if (hideTextSize.width > maxWidth) {
      return { showTips: true, width: maxWidth };
    }
    return undefined;
  }, [hideTextSize?.width, maxWidth]);

  const showTips = handleResult?.showTips;

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
        <span className="tow-content" style={{ width: handleResult?.width }}>
          <span className="tow-show-text" onClick={props.onClick}>
            {props.text}
          </span>
        </span>
      </Tooltip>
    </div>
  );
};
