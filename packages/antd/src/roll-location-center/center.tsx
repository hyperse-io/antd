import { type CSSProperties, type ReactElement, useRef } from 'react';
import { useMutationObserver } from 'ahooks';
import { classNames } from '@dimjs/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type RollLocationCenterProps = {
  renderList: { activeKey: string; render: ReactElement }[];
  activeKey?: string;
  behavior?: ScrollBehavior;
  direction?: 'horizontal' | 'vertical';
  style?: CSSProperties;
  className?: string;
};
export const RollLocationCenter = (props: RollLocationCenterProps) => {
  const rollLocationCenterRef = useRef<HTMLDivElement>(null);
  const behavior = props.behavior || 'smooth';
  const direction = props.direction || 'vertical';

  const targetVerticalRoll = (key: string) => {
    const targetNode = rollLocationCenterRef.current?.querySelector(
      `.roll-location-center-${key}`
    ) as HTMLDivElement;
    if (!targetNode) return;
    const parentNodeHeight = rollLocationCenterRef.current
      ?.offsetHeight as number;
    const targetNodeOffsetTop = targetNode.offsetTop;
    const targetNodeHeight = targetNode.offsetHeight;
    if (targetNodeOffsetTop <= targetNodeHeight) {
      rollLocationCenterRef.current?.scrollTo({ top: 0, behavior });
    } else {
      const rollHeight =
        targetNodeOffsetTop - parentNodeHeight / 2 + targetNodeHeight / 2;
      if (rollHeight > 0) {
        rollLocationCenterRef.current?.scrollTo({ top: rollHeight, behavior });
      } else {
        rollLocationCenterRef.current?.scrollTo({ top: 0, behavior });
      }
    }
  };
  const targetHorizontalRoll = (key: string) => {
    const targetNode = rollLocationCenterRef.current?.querySelector(
      `.roll-location-center-${key}`
    ) as HTMLDivElement;
    if (!targetNode) return;
    const parentNodeWidth = rollLocationCenterRef.current
      ?.offsetWidth as number;
    const targetNodeOffsetLeft = targetNode.offsetLeft;
    const targetNodeWidth = targetNode.offsetWidth;
    if (targetNodeOffsetLeft <= targetNodeWidth) {
      rollLocationCenterRef.current?.scrollTo({ left: 0, behavior });
    } else {
      const rollWidth =
        targetNodeOffsetLeft - parentNodeWidth / 2 + targetNodeWidth / 2;
      if (rollWidth > 0) {
        rollLocationCenterRef.current?.scrollTo({ left: rollWidth, behavior });
      } else {
        rollLocationCenterRef.current?.scrollTo({ left: 0, behavior });
      }
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
    rollLocationCenterRef,
    {
      subtree: true,
      childList: true,
      characterData: true,
    }
  );

  return (
    <div
      className={classNames(
        'roll-location-center',
        `roll-location-center-${direction}`,
        props.className
      )}
      style={props.style}
      ref={rollLocationCenterRef}
    >
      {props.renderList.map((item) => {
        return (
          <div
            className={`roll-location-center-${item.activeKey}`}
            key={item.activeKey}
          >
            {item.render}
          </div>
        );
      })}
    </div>
  );
};
