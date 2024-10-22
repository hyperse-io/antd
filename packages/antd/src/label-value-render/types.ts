import { type ReactElement } from 'react';

export type TLabelValueItem = {
  label: string | ReactElement;
  value?: string | number | ReactElement;
  /** 根据LabelValueRender.column配置，当前item占几列  */
  span?: 1 | 2 | 3 | 4 | 6;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 超出宽度是否隐藏 */
  ellipsis?: boolean;
  /** 是否添加必填标识 */
  required?: boolean;
  /** 添加说明标签 */
  tips?: string;
  /** value 点击事件 */
  onClick?: (e) => void;
};

export type TLabelValueRenderItem = Omit<TLabelValueItem, 'span'> & {
  grid: number;
  isLast?: boolean;
  // replenish?: boolean;
};
