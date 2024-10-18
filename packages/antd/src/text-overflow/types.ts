import { ReactElement } from 'react';

export type TextOverflowProps = {
  /** text 为ReactElement类型时，maxLength配置无效 */
  text: string | ReactElement;
  /** 最大显示宽度 */
  maxWidth?: number;
  /** 最大显示字数 */
  maxLength?: number;

  onClick?: (e) => void;
};
