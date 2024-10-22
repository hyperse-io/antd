import {
  cloneElement,
  type CSSProperties,
  Fragment,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '@dimjs/utils';
import { toArray } from '@hyperse/utils';
import { type CommonPropsWithChildren } from '../_utils/native-props.js';
import './style.less';

export type CssHoverProps = {
  children: ReactElement | ReactElement[];
} & Pick<
  CommonPropsWithChildren<{
    '--v-css-hover-bgcolor': CSSProperties['backgroundColor'];
    '--v-css-hover-opacity': CSSProperties['opacity'];
    '--v-css-hover-border-radius': CSSProperties['borderRadius'];
  }>,
  'style' | 'children'
>;
/**
 * css hover 效果
 * ```
 * 1. 当children为数组时，会为children添加父级（会产生新节点）
 * 2. 当children为单个元素时，会在children元素上添加className、style（不会产生新节点）
 * ```
 * @param props
 * @returns
 */
export const CssNodeHover = (props: CssHoverProps) => {
  const children = toArray<ReactNode>(props.children);
  if (children.length > 1) {
    return (
      <div className="v-css-hover" style={props.style}>
        {children}
      </div>
    );
  }

  const element = props.children as ReactElement;

  return (
    <Fragment>
      {cloneElement(element, {
        className: classNames('v-css-hover', element.props.className),
        style: { ...props.style, ...element.props.style },
      })}
    </Fragment>
  );
};
