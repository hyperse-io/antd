import { Card, type CardProps } from 'antd';
import { classNames } from '@dimjs/utils';
import './style.less';
/**
 * ```
 * 主要为了解决，标题固定，内容滚动
 * ```
 * @param props
 * @returns
 */
export const CardWrapper = (props: CardProps) => {
  return (
    <Card {...props} className={classNames('card-wrapper', props.className)} />
  );
};
