import { type DetailedHTMLProps } from 'react';
import { classNames } from '@dimjs/utils';
import './style.less';

type BlockLayoutProps = DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
/**
 * 块布局（控制light/dark模式下，块背景色和字体颜色）
 * ```
 * 1. light 模式
 *   网页背景色为 #1b1a1a（黑灰），此时块布局背景色为 #000（黑色），字体颜色rgba(255, 255, 255, 0.85)
 * 2. dark 模式
 *   网页背景色为 #f9f9f9（白灰），此时块布局背景色为 #FFF（白色），字体颜色rgba(0, 0, 0, 0.88)
 * ```
 * @param props
 * @returns
 */
export const BlockLayout = (props: BlockLayoutProps) => {
  return (
    <div {...props} className={classNames('block-layout', props.className)}>
      {props.children}
    </div>
  );
};
