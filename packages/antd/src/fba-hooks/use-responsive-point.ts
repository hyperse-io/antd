import { useMemo } from 'react';
import { Grid } from 'antd';

/**
 * 获取响应式节点
 * ```
 * xs < 576px
 * sm ≥ 576px
 * md ≥ 768px
 * lg ≥ 992px
 * xl ≥ 1200px
 * xxl ≥ 1600px
 * ```
 */
export const useResponsivePoint = () => {
  const screens = Grid.useBreakpoint();
  return useMemo(() => {
    const filter = Object.keys(screens).filter((key) => {
      return screens[key] === true;
    });
    const order = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const targetIndex = order.findIndex((key) => filter.includes(key));
    return order[targetIndex] as string | undefined;
  }, [screens]);
};
