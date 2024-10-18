import { type FC, useContext, useMemo } from 'react';
import { classNames } from '@dimjs/utils';
import { BoxGridProviderCtx } from './ctx.js';
import { type ICommonReact } from './type.js';

export type BoxColProps = {
  /**
   * 栅格占位格数
   * span 优先级最高：配置了span后，其他的响应式配置将失效；
   * 范围 0 ～ 24
   * 为  0  相当于隐藏
   * 为  24  相当于独占一行
   */
  span?: number;
  /** 屏幕 < 576px  */
  xs?: number;
  /** 屏幕 ≥ 576px */
  sm?: number;
  /** 屏幕 ≥ 768px */
  md?: number;
  /** 屏幕 ≥ 992px */
  lg?: number;
  /** 屏幕 ≥ 1200px */
  xl?: number;
  /** 屏幕 ≥ 1600px */
  xxl?: number;
};

export const Col: FC<BoxColProps & ICommonReact> = (props) => {
  const { children, className, style } = props;
  const { defaultGrid, horizontalGap, boxBreakpoint } =
    useContext(BoxGridProviderCtx);

  const span = useMemo(() => {
    return (
      props.span ||
      props[boxBreakpoint || 'lg'] ||
      defaultGrid?.[boxBreakpoint || 'lg'] ||
      8
    );
  }, [props, boxBreakpoint, defaultGrid]);

  return (
    <div
      className={classNames(className, 'box-grad-col')}
      style={{
        ...style,
        flex: `0 0 ${(span / 24) * 100}%`,
        maxWidth: `${(span / 24) * 100}%`,
        padding: `0 ${horizontalGap / 2}px`,
      }}
    >
      {children}
    </div>
  );
};

Col['domTypeName'] = 'BoxGridCol';
