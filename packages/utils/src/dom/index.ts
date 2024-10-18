import { getUuid } from '../string/uuid';
import { findParentsElement } from './find-parents-element';
import { getScrollNode } from './get-scroll-node';

export interface BodyAppendDivElementProps {
  divElement: HTMLDivElement;
  elementId: string;
}

const bodyAppendDivElement = (): BodyAppendDivElementProps => {
  const div = document.createElement('div');
  const id = `id_${Date.now()}`;
  div.setAttribute('id', id);
  document.body.append(div);
  return {
    divElement: div,
    elementId: id,
  };
};

const createDivElement = () => {
  const div = document.createElement('div');
  const id = `id_${getUuid()}`;
  div.setAttribute('id', id);
  return div;
};

// 删除body的子节点
const removeBodyChild = (element: string) => {
  try {
    document.body.removeChild(document.querySelector(element) as Node);
  } catch (_error) {
    //
  }
};

export const dom = {
  bodyAppendDivElement,
  createDivElement,
  removeBodyChild,
  /**
   * 查询指定节点层层父节点中第一个原生滚动节点
   * @param el
   * @param root
   * https://github.com/youzan/vant/issues/3823
   */
  getScrollNode,
  /**
   * 查找层层父节点中的目标元素
   * @param originNode  起始节点
   * @param verify 判断是否为目标节点
   */
  findParentsElement,
};
