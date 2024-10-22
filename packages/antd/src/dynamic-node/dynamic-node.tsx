import { type CSSProperties, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { classNames } from '@dimjs/utils';
import { bodyAppendDivElement } from '../_utils/dom.js';
import './style.less';

export type TDynamicNodeProps = {
  className?: string;
  getContainer?: HTMLElement | (() => HTMLElement) | string;
  content?: ReactElement;
  fixed?: boolean;
  style?: CSSProperties;
};

/**
 * 动态添加 element 元素
 * ```
 * 1. 默认添加到 body 下
 * 2. 可通过 getContainer 参数设置添加位置
 * ```
 */
export const dynamicNode = {
  append: (props: TDynamicNodeProps = {}) => {
    const container = (() => {
      let tempElement;
      if (typeof props.getContainer === 'string') {
        tempElement = document.querySelector(props.getContainer) as Element;
      } else if (typeof props.getContainer === 'function') {
        tempElement = props.getContainer();
      } else {
        tempElement = bodyAppendDivElement().divElement;
      }
      return tempElement as Element;
    })();

    const className = classNames(
      'v-dynamic-node',
      { 'v-dynamic-node-fixed': props.fixed },
      props.className
    );
    const nodeElementId = `id_${Date.now()}`;
    const root = createRoot(container);
    root.render(
      <div className={className} id={nodeElementId}>
        {props.content}
      </div>
    );
    window['_dynamic_node_element_id'] = nodeElementId;
    return { elementId: nodeElementId };
  },
  remove: (elementId?: string) => {
    const dynamicElementId = elementId || window['_dynamic_node_element_id'];
    if (dynamicElementId) {
      try {
        document.querySelector(`#${dynamicElementId}`)?.remove();
      } catch (_error) {
        //
      }
    }
  },
};
