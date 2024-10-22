import { type CSSProperties, type ReactElement, useRef } from 'react';
import { useMutationObserver } from 'ahooks';
import { classNames } from '@dimjs/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type RollLocationInViewProps = {
  renderList: { activeKey: string; render: ReactElement }[];
  activeKey?: string;
  behavior?: ScrollBehavior;
  // 激活节点在边界时，上下节点露出偏移量
  activeOffset?: number;
  direction?: 'horizontal' | 'vertical';
  style?: CSSProperties;
  className?: string;
};
export const RollLocationInView = (props: RollLocationInViewProps) => {
  const rollLocationInViewRef = useRef<HTMLDivElement>(null);
  const behavior = props.behavior || 'smooth';
  const activeOffset = props.activeOffset || 0;
  const direction = props.direction || 'vertical';

  const targetVerticalRoll = (key: string) => {
    try {
      const targetNode = rollLocationInViewRef.current?.querySelector(
        `.roll-location-in-view-item-${key}`
      ) as HTMLDivElement;
      const parentNodeHeight = rollLocationInViewRef.current
        ?.offsetHeight as number;
      const scrollerScrollTop = rollLocationInViewRef.current
        ?.scrollTop as number;
      const targetNodeOffsetTop = targetNode.offsetTop;
      const targetTop2ScrollWindowHeight =
        targetNodeOffsetTop - scrollerScrollTop;
      const targetNodeHeight = targetNode.offsetHeight;
      if (targetNodeOffsetTop === 0) {
        rollLocationInViewRef.current?.scrollTo({ top: 0, behavior });
      } else {
        if (targetTop2ScrollWindowHeight < 0) {
          rollLocationInViewRef.current?.scrollTo({
            top: targetNodeOffsetTop - activeOffset,
            behavior,
          });
        } else if (
          targetTop2ScrollWindowHeight >= 0 &&
          targetTop2ScrollWindowHeight + targetNodeHeight < parentNodeHeight
        ) {
          //
        } else {
          const xx =
            targetNodeOffsetTop - (parentNodeHeight - targetNodeHeight);
          rollLocationInViewRef.current?.scrollTo({
            top: xx + activeOffset,
            behavior,
          });
        }
      }
    } catch (_error) {
      // 异常不处理
    }
  };
  const targetHorizontalRoll = (key: string) => {
    try {
      const targetNode = rollLocationInViewRef.current?.querySelector(
        `.roll-location-in-view-item-${key}`
      ) as HTMLDivElement;
      const parentNodeWidth = rollLocationInViewRef.current
        ?.offsetWidth as number;
      const scrollerScrollLeft = rollLocationInViewRef.current
        ?.scrollLeft as number;
      const targetNodeOffsetLeft = targetNode.offsetLeft;
      const targetTop2ScrollWindowWidth =
        targetNodeOffsetLeft - scrollerScrollLeft;
      const targetNodeWidth = targetNode.offsetWidth;
      if (targetNodeOffsetLeft === 0) {
        rollLocationInViewRef.current?.scrollTo({ left: 0, behavior });
      } else {
        if (targetTop2ScrollWindowWidth < 0) {
          rollLocationInViewRef.current?.scrollTo({
            left: targetNodeOffsetLeft - activeOffset,
            behavior,
          });
        } else if (
          targetTop2ScrollWindowWidth >= 0 &&
          targetTop2ScrollWindowWidth + targetNodeWidth < parentNodeWidth
        ) {
          //
        } else {
          const xx = targetNodeOffsetLeft - (parentNodeWidth - targetNodeWidth);
          rollLocationInViewRef.current?.scrollTo({
            left: xx + activeOffset,
            behavior,
          });
        }
      }
    } catch (_error) {
      // 异常不处理
    }
  };

  fbaHooks.useEffectCustom(() => {
    if (props.activeKey) {
      if (direction === 'vertical') {
        targetVerticalRoll(props.activeKey);
      } else {
        targetHorizontalRoll(props.activeKey);
      }
    }
  }, [props.activeKey]);

  useMutationObserver(
    () => {
      if (props.activeKey) {
        if (direction === 'vertical') {
          targetVerticalRoll(props.activeKey);
        } else {
          targetHorizontalRoll(props.activeKey);
        }
      }
    },
    rollLocationInViewRef,
    {
      subtree: true,
      childList: true,
      characterData: true,
    }
  );

  return (
    <div
      className={classNames(
        'roll-location-in-view',
        `roll-location-in-view-${direction}`,
        props.className
      )}
      style={props.style}
      ref={rollLocationInViewRef}
    >
      {props.renderList.map((item) => {
        return (
          <div
            className={`roll-location-in-view-item-${item.activeKey}`}
            key={item.activeKey}
          >
            {item.render}
          </div>
        );
      })}
    </div>
  );
};
