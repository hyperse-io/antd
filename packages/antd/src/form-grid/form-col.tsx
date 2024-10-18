import { ReactNode } from 'react';
import { Col } from 'antd';
const forceAloneRowGrid = { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 };
export type FormColProps = {
  /** 栅格占位格数，替换lg、xl、xxl默认数据 */
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
  /** 强制单独一行 */
  forceAloneRow?: boolean;
  children?: ReactNode | ReactNode[];
  hidden?: boolean;
};

/**
 * 网格响应式布局，默认值：{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
 *```
 * 1. 设置 span 栅格占位格数，替换lg、xl、xxl默认数据，不替换xs、sm布局数据
 * 2. grid 自定义响应式网格布局
 * xs: 屏幕 < 576px
 * sm: 屏幕 ≥ 576px
 * md: 屏幕 ≥ 768px
 * lg: 屏幕 ≥ 992px
 * xl: 屏幕 ≥ 1200px
 * xxl: 屏幕 ≥ 1600px
 * ```
 */
export const FormCol = (props: FormColProps) => {
  const { forceAloneRow, hidden, ...otherProps } = props;
  const forceGrid = forceAloneRow ? forceAloneRowGrid : otherProps;
  if (hidden) return null;
  return <Col {...forceGrid}>{props.children}</Col>;
};

FormCol['domTypeName'] = 'FormCol';
