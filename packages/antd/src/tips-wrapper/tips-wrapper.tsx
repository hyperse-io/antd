import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Popover, type PopoverProps, Tooltip, type TooltipProps } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull } from '@hyperse/utils';
import './style.less';

export type TipsWrapperProps = {
  // 间隙，默认值：3
  gap?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  icon?: ReactElement;
  /** Icon添加点击事件，设置hoverTips后失效 */
  onClick?: (event) => void;
  /**
   * 提示效果类型
   * ```
   * 1. popover 气泡卡片，内容通过popoverProps设置
   * 2. tooltip 文字提示，内容通过tooltipProps设置
   * ```
   */
  tipType?: 'popover' | 'tooltip';
  popoverProps?: PopoverProps;
  tooltipProps?: TooltipProps;
  trigger?: 'icon' | 'all';
};

/**
 * 为目标元素右侧添加Icon
 * ```
 * Icon有两种交互行为
 * 1. 鼠标悬浮显示提示效果;
 * 2. 为Icon添加点击事件
 *
 * 例如：
 * 1.
 * <TipsWrapper tipType="tooltip" tooltipProps={{ title:'说明文案' }}>ABC</TipsWrapper>
 * 2.
 * <TipsWrapper tipType="popover" popoverProps={{ title:'说明标题', content:'说明内容' }}>ABC</TipsWrapper>
 * 3.
 * <TipsWrapper onClick={noop}>ABC</TipsWrapper>
 * ```
 */
export const TipsWrapper = (props: TipsWrapperProps) => {
  const icon = props.icon || <QuestionCircleOutlined />;
  const trigger = props.trigger || 'icon';
  const gap = isUndefinedOrNull(props.gap) ? 3 : props.gap;
  if (props.tipType === 'tooltip' && trigger === 'icon') {
    return (
      <span
        className={classNames('tips-wrapper', props.className)}
        style={props.style}
      >
        <span className="tips-wrapper-text" style={{ marginRight: gap }}>
          {props.children}
        </span>
        <Tooltip {...props.tooltipProps}>
          <span className="tips-wrapper-icon">{icon}</span>
        </Tooltip>
      </span>
    );
  }
  if (props.tipType === 'tooltip' && trigger === 'all') {
    return (
      <Tooltip {...props.tooltipProps}>
        <span
          className={classNames('tips-wrapper', props.className)}
          style={props.style}
        >
          <span className="tips-wrapper-text" style={{ marginRight: gap }}>
            {props.children}
          </span>
          <span className="tips-wrapper-icon">{icon}</span>
        </span>
      </Tooltip>
    );
  }

  if (props.tipType === 'popover' && trigger === 'icon') {
    return (
      <span
        className={classNames('tips-wrapper', props.className)}
        style={props.style}
      >
        <span className="tips-wrapper-text" style={{ marginRight: gap }}>
          {props.children}
        </span>
        <Popover {...props.popoverProps}>
          <span className="tips-wrapper-icon">{icon}</span>
        </Popover>
      </span>
    );
  }
  if (props.tipType === 'popover' && trigger === 'all') {
    return (
      <Popover {...props.popoverProps}>
        <span
          className={classNames('tips-wrapper', props.className)}
          style={props.style}
        >
          <span className="tips-wrapper-text" style={{ marginRight: gap }}>
            {props.children}
          </span>
          <span className="tips-wrapper-icon">{icon}</span>
        </span>
      </Popover>
    );
  }

  if (props.onClick && trigger === 'icon') {
    return (
      <span
        className={classNames('tips-wrapper', props.className)}
        style={props.style}
      >
        <span className="tips-wrapper-text" style={{ marginRight: gap }}>
          {props.children}
        </span>
        <span onClick={props.onClick} className="tips-wrapper-icon">
          {icon}
        </span>
      </span>
    );
  }
  if (props.onClick && trigger === 'all') {
    return (
      <span
        className={classNames('tips-wrapper', props.className)}
        style={props.style}
        onClick={props.onClick}
      >
        <span className="tips-wrapper-text" style={{ marginRight: gap }}>
          {props.children}
        </span>
        <span className="tips-wrapper-icon">{icon}</span>
      </span>
    );
  }
  if (props.icon) {
    return (
      <span
        className={classNames('tips-wrapper', props.className)}
        style={props.style}
      >
        <span className="tips-wrapper-text" style={{ marginRight: gap }}>
          {props.children}
        </span>
        <span className="tips-wrapper-icon">{icon}</span>
      </span>
    );
  }
  return <Fragment>{props.children}</Fragment>;
};
