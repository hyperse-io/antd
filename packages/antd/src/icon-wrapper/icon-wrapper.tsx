import { CSSProperties, Fragment } from 'react';
import { Popover, Tooltip } from 'antd';
import { isUndefined } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import './style.less';

export type IconWrapperProps = {
  hoverTips?: string | React.ReactElement;
  /**
   * 提示类型
   * @default 'tooltip'
   */
  tipsType?: 'popover' | 'tooltip';
  icon?: React.ReactNode;
  style?: CSSProperties;
  text?: string | React.ReactElement;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  onClick?: (event) => void;
  hideHoverBgColor?: boolean;
  hidden?: boolean;
  /** 图标对比文字的位置，默认：brefore */
  position?: 'before' | 'after';
  /** 图标与文字之间的间距 */
  gap?: number;
};
export const IconWrapper = (props: IconWrapperProps) => {
  const {
    gap,
    size,
    hideHoverBgColor,
    onClick,
    className,
    hidden,
    style,
    icon,
    position,
    text,
    hoverTips,
    tipsType,
    ...otherProps
  } = props;
  const gapNew = isUndefined(gap) ? 5 : gap;
  const classNameNew = classNames(
    'icon-wrapper',
    `icon-wrapper-${size || 'middle'}`,
    {
      'icon-wrapper-hidden-hover-bgcolor': hideHoverBgColor,
      'icon-wrapper-tigger': !!Object.keys(props).find((item) =>
        item.startsWith('on')
      ),
    },

    className
  );

  if (hidden) return <Fragment />;

  const _content =
    position === 'after' ? (
      <span
        className={classNameNew}
        style={style}
        onClick={onClick}
        {...otherProps}
      >
        {text ? (
          <span className="icon-wrapper-text" style={{ marginRight: gapNew }}>
            {text}
          </span>
        ) : null}
        {icon}
      </span>
    ) : (
      <span
        className={classNameNew}
        style={style}
        onClick={onClick}
        {...otherProps}
      >
        {icon}
        {text ? (
          <span className="icon-wrapper-text" style={{ marginLeft: gapNew }}>
            {text}
          </span>
        ) : null}
      </span>
    );
  if (hoverTips) {
    if (tipsType === 'popover') {
      return (
        <Popover content={hoverTips} {...otherProps}>
          {_content}
        </Popover>
      );
    }
    return (
      <Tooltip title={hoverTips} {...otherProps}>
        {_content}
      </Tooltip>
    );
  }
  return _content;
};
