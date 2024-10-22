import { type CSSProperties, useMemo } from 'react';
import { classNames } from '@dimjs/utils';
import { isHttpUri } from '@hyperse/utils';
import './style.less';
export type SvgHttpViewProps = {
  /**
   * svg地址
   * ```
   * 1. 可传http绝对路径
   * 2. 可传ionic组图标，例如：ionic/alarm-outline
   * 3. 可传lucide组图标，例如：lucide/crosshair
   *
   * 查询ionic、lucide图标 https://fex.qa.tcshuke.com/docs/admin/resources/icons
   * ```
   */
  svgPath: string;
  /** 默认：20px */
  width?: number;
  /** 默认：20px */
  height?: number;
  /** svg 颜色， 默认：#555 */
  color?: string;
  onClick?: (e) => void;
  className?: string;
  style?: CSSProperties;
};

/**
 * http svg地址解析，可自定义颜色
 * ```
 * 1. 内置ionic、lucide组图标基础路径
 * 2. 可传自定义http绝对路径svg数据
 * 3.
 * ```
 */
export const SvgHttpView = (props: SvgHttpViewProps) => {
  const {
    color,
    svgPath,
    className,
    height,
    width,
    style,
    onClick,
    ...otherProps
  } = props;
  const colorNew = color || '#555';

  const srcLink = isHttpUri(svgPath)
    ? svgPath
    : `https://file.40017.cn/tcsk/alicon/${svgPath}.svg`;

  const size = useMemo(() => {
    if (width || height) {
      return { width, height };
    }
    return { width: 20, height: 20 };
  }, [height, width]);

  return (
    <div
      {...otherProps}
      onClick={onClick}
      className={classNames('http-svg-view', className)}
      style={{ width: size.width, height: size.height, ...style }}
    >
      <div
        className="hsv-content"
        style={{ filter: `drop-shadow(${colorNew} 200px 0)` }}
      >
        <img src={srcLink} />
      </div>
    </div>
  );
};
