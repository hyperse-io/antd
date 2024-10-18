/**
 * 查找层层父节点中的目标元素
 * @param originNode  起始节点
 * @param verify 判断是否为目标节点
 */
export const findParentsElement = (
  originNode: HTMLElement | null,
  verify: (node: HTMLElement) => boolean
) => {
  while (originNode != null) {
    if (verify(originNode)) {
      return originNode;
    }
    originNode = originNode.parentNode as HTMLElement;
  }
  return null;
};
