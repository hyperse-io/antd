import {
  Children,
  cloneElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '@dimjs/utils';
import { toArray } from '@hyperse/utils';
import './style.less';

export type FlexLayoutProps = {
  className?: string;
  /** 子组件铺满的索引值，从0开始 */
  fullIndex: number | number[];
  /**方向，默认值vertical */
  direction?: 'vertical' | 'horizontal';
  onClick?: () => void;
  style?: CSSProperties;
  /** 间隙尺寸 */
  gap?: number;
  children?: ReactNode | null | Array<ReactNode | null>;
};
/**
 * flex布局，主要用于Flex结构性布局
 * ```
 * 4.2.87版本中将fullIndex改为了必填属性，如果在升级中遇到问题，不确定怎么写，可设置 fullIndex=[] 保持原样
 * ```
 */
export const FlexLayout = (props: FlexLayoutProps) => {
  const childrens = Children.toArray(props.children) as ReactElement[];
  const direction = props.direction || 'vertical';
  const gap = props.gap ? props.gap : 0;
  const fullIndexList = toArray<number>(props.fullIndex);

  return (
    <div
      className={classNames(
        'v-flex-layout',
        `v-flex-${direction}`,
        props.className
      )}
      style={{
        ...props.style,
        gap,
      }}
      onClick={props.onClick}
    >
      {childrens.map((children, index) => {
        const childrenStyle = children.props?.style || {};
        const style = fullIndexList.includes(index)
          ? { flex: 1, ...childrenStyle }
          : { flexShrink: 0, ...childrenStyle };
        // if (index < childrens.length - 1 && gap > 0) {
        //   if (direction === 'horizontal') {
        //     style.marginRight = gap;
        //   } else {
        //     style.marginBottom = gap;
        //   }
        // }
        return cloneElement(children, { style, key: index });
      })}
    </div>
  );
};
