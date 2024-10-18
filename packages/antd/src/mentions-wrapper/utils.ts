import { type OverallKeyWordsPosition } from './types.js';

export const getOverallKeyWordsPosition = (params: {
  overallKeyWords: string[];
  value?: string;
}) => {
  if (!params.value || !params.overallKeyWords.length) return [];
  const overallKeyWordsNew = Array.from(new Set(params.overallKeyWords || []));
  const positionItem: OverallKeyWordsPosition[][] = [];
  overallKeyWordsNew.forEach((item) => {
    if (!params.value?.includes(item)) return;
    const newItem = item
      .replace(/\$/g, '\\$')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\]/g, '\\]')
      .replace(/\[/g, '\\[');
    const regex = new RegExp(newItem, 'g');
    const positions: number[] = [];
    let match;
    while ((match = regex.exec(params.value)) !== null) {
      positions.push(match.index as number);
    }
    const innerList: OverallKeyWordsPosition[] = [];
    positions.forEach((temp) => {
      innerList.push({ start: temp + 1, end: temp + item.length });
    });
    positionItem.push(innerList);
  });
  return positionItem;
};

/**
 * 判断光标是否处在关键词位置内
 */
export const judgmentCursorInKeyWordsPosition = (params: {
  keyWordsPosition: OverallKeyWordsPosition[][];
  cursorPosition: number;
}) => {
  for (let index = 0; index < params.keyWordsPosition.length; index++) {
    const element = params.keyWordsPosition[index].find((temp) => {
      return (
        params.cursorPosition >= temp.start && params.cursorPosition < temp.end
      );
    });
    if (element) return element;
  }
  return undefined;
};
