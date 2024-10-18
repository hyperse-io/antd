export function parentsHasSticky(node: Element) {
  let condition = true;
  let result = false;
  while (condition) {
    if (node.tagName === 'HTML' || node.tagName === 'BODY') {
      condition = false;
      result = false;
    } else {
      const { position } = window.getComputedStyle(node);
      if (position === 'sticky') {
        result = true;
        condition = false;
      } else {
        if (!node || !node.parentNode) {
          condition = false;
        } else {
          node = node.parentNode as Element;
        }
      }
    }
  }
  return result;
}
