import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Space } from 'antd';
import { isArray } from '@dimjs/lang';
import { classNames, extend } from '@dimjs/utils';
import { BlockLayout } from '../block-layout/index.js';
import './style.less';

export type CardLayoutProps = {
  /** 描述 */
  desc?: string | string[] | ReactElement | ReactElement[];
  /** 标题 */
  title?: string | ReactElement;
  /** 子标题，在标题右侧 */
  subTitle?: string | ReactElement;
  /**
   * layoutType 布局类型
   * ```
   * 1. layer：分层布局
   * 2. tight：紧凑布局（没有外边距）
   * ```
   */
  layoutType?: 'layer' | 'tight';
  /** 隐藏标题左侧符号 */
  titleLeftLine?: boolean;
  titleStyle?: CSSProperties;
  titleContentStyle?: CSSProperties;
  subTitleStyle?: CSSProperties;
  titleExtraStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  /** 优先级大于 style padding */
  padding?: CSSProperties['padding'];
  /** 优先级大于 style width */
  width?: CSSProperties['width'];
  /** 优先级大于 style height */
  height?: CSSProperties['height'];
  /** 标题右侧布局 */
  titleExtra?: string | ReactElement;
  /** 当存在滚动条时，标题固定，滚动区域为内部部分 */
  titleFixed?: boolean;
  /**
   * 间距尺寸
   * 1. default = 15
   * 2. small = 8
   */
  size?: 'default' | 'small';
  onClick?: (event) => void;
  hidden?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * 卡片结构布局
 * ```
 * 1. layoutType 布局类型
 *    layer：分层布局
 *    tight：紧凑布局（没有外边距）
 * ```
 */
export const CardLayout = (props: CardLayoutProps) => {
  const className = classNames(
    'card-layout',
    {
      'card-layout-tight': props.layoutType === 'tight',
      // 'card-layout-formlabel-left': labelAlign === 'left',
      'card-layout-title-fixed': props.titleFixed,
      'card-layout-small': props.size === 'small',
    },
    props.className
  );

  // const theme = fbaHooks.useThemeToken();
  const style = extend(
    // { '--card-layout-colorPrimary': theme.colorPrimary },
    props.style,
    {
      padding: props.padding,
      width: props.width,
      height: props.height,
      overflowY:
        !props.titleFixed && (props.height || props.style?.height)
          ? 'auto'
          : undefined,
    }
  );

  if (props.hidden) return <Fragment />;

  return (
    <BlockLayout className={className} style={style} onClick={props.onClick}>
      {props.title || props.titleExtra ? (
        <div
          className={classNames('card-layout-title', {
            'card-layout-title-sign': props.title ? props.titleLeftLine : false,
          })}
          style={props.titleStyle}
        >
          {props.subTitle ? (
            <Fragment>
              <div
                className="card-layout-title-content"
                style={props.titleContentStyle}
              >
                {props.title}
              </div>
              <div
                className="card-layout-subtitle"
                style={{ marginLeft: 10, ...props.subTitleStyle }}
              >
                {props.subTitle}
              </div>
            </Fragment>
          ) : (
            <div
              className="card-layout-title-content"
              style={{
                flex: 1,
                ...props.titleContentStyle,
              }}
            >
              {props.title}
            </div>
          )}

          {props.titleExtra ? (
            <div
              className="card-layout-title-extra"
              style={props.titleExtraStyle}
            >
              {props.titleExtra}
            </div>
          ) : null}
        </div>
      ) : null}
      {props.desc && !isArray(props.desc) ? (
        <div className="card-layout-desc">{props.desc}</div>
      ) : null}
      {props.desc && isArray(props.desc) ? (
        <div className="card-layout-desc-list">
          <Space direction="vertical" size={0}>
            {(props.desc as string[]).map((item, index) => {
              return <Fragment key={index}>{item}</Fragment>;
            })}
          </Space>
        </div>
      ) : null}
      {props.children ? (
        <div className="card-layout-content" style={props.contentStyle}>
          {props.children}
        </div>
      ) : null}
    </BlockLayout>
  );
};

CardLayout.defaultProps = {
  titleLeftLine: true,
  layoutType: 'layer',
};
