import { useMemo } from 'react';
import { useSize } from 'ahooks';
import { isNumber } from '@dimjs/lang';
import { DefaultGutter } from './constant.js';
import { defaultCtx } from './ctx.js';
import { type GutterParams, type TBoxBreakpoint } from './type.js';

/**
 * 监听盒子大小变化，返回当前的断点
 * @param dom
 * @returns
 */
export const useBoxBreakpoint = (dom) => {
  const { width } = useSize(dom) || {};

  const boxBreakpoint = useMemo<TBoxBreakpoint>(() => {
    const w = width || dom?.clientWidth;
    if (!w) {
      return 'lg';
    }

    if (w >= 1600) {
      return 'xxl';
    } else if (w >= 1200) {
      return 'xl';
    } else if (w >= 992) {
      return 'lg';
    } else if (w >= 768) {
      return 'md';
    } else if (w >= 576) {
      return 'sm';
    } else {
      return 'xs';
    }
  }, [width]);

  return {
    boxBreakpoint,
    /** width为0，或者不存在 */
    haveWidth: !!width,
  };
};

/**
 * 处理间距
 * @param gutter
 * @param boxBreakpoint
 * @returns
 */
export const useGutter = (
  gutter: GutterParams = DefaultGutter,
  boxBreakpoint: TBoxBreakpoint
) => {
  return useMemo(() => {
    let horizontalGap: number;
    let verticalGap: number;

    const getCommonGutter = (gutter) => {
      if (typeof gutter === 'number') {
        return gutter;
      }
      if (typeof gutter === 'object') {
        return { ...DefaultGutter, ...gutter }[boxBreakpoint];
      }
    };

    if (Array.isArray(gutter)) {
      const [h, v] = gutter;
      horizontalGap = getCommonGutter(h);
      verticalGap = getCommonGutter(v);
    } else {
      horizontalGap = getCommonGutter(gutter);
      verticalGap = defaultCtx.verticalGap;
    }

    return {
      horizontalGap: isNumber(horizontalGap)
        ? horizontalGap
        : defaultCtx.horizontalGap,
      verticalGap: isNumber(verticalGap) ? verticalGap : defaultCtx.verticalGap,
    };
  }, [gutter, boxBreakpoint]);
};
