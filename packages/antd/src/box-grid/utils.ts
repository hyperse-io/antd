import { type TBoxBreakpoint } from './type.js';

/**
 * 获取栅格响应式布局的配置
 * @param minSize 元素的最小可接受宽度
 * @returns
 */
export const getGridMapByRange = (
  minSize: number
): Record<TBoxBreakpoint, number> => {
  const getSpan = (threshold: number) => {
    const result = Math.ceil((minSize * 24) / threshold);
    return [1, 2, 3, 4, 6, 8, 12, 24].find((item) => item >= result) || 24;
  };

  return {
    xxl: getSpan(1600),
    xl: getSpan(1200),
    lg: getSpan(992),
    md: getSpan(768),
    sm: getSpan(576),
    xs: getSpan(200),
  };
};
