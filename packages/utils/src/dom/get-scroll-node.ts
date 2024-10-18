type ScrollElement = HTMLElement | Window | Document;

const overflowScrollReg = /scroll|auto/i;
const defaultRoot = window;

function isElement(node: Element) {
  const ELEMENT_NODE_TYPE = 1;
  return (
    node.tagName !== 'HTML' &&
    node.tagName !== 'BODY' &&
    node.nodeType === ELEMENT_NODE_TYPE
  );
}

/**
 * 查询指定节点层层父节点中第一个原生滚动节点
 * @param el
 * @param root
 * https://github.com/youzan/vant/issues/3823
 */
export function getScrollNode(
  el: Element,
  root: ScrollElement | null | undefined = defaultRoot
) {
  let node = el;

  while (node && node !== root && isElement(node)) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowScrollReg.test(overflowY)) {
      return node;
    }
    node = node.parentNode as Element;
  }

  return root;
}
