import { Col } from './col.js';
import { Row } from './row.js';
import { getGridMapByRange } from './utils.js';
import './index.less';

export { useBoxBreakpoint } from './hooks.js';

export const BoxGrid = {
  /**
   *  网格响应式布局
   *```
   * 1. 应用场景：根据盒子大小决定内部元素的布局
   * 2. 子元素只能是 BoxGrid.Col
   */
  Row,
  /**
   * 网格响应式布局，默认值：{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
   *```
   * 1. 设置 span 栅格占位格数，0 ～ 24
   * 2. grid 自定义响应式网格布局
   * xs: 容器尺寸 < 576px
   * sm: 容器尺寸 ≥ 576px
   * md: 容器尺寸 ≥ 768px
   * lg: 容器尺寸 ≥ 992px
   * xl: 容器尺寸 ≥ 1200px
   * xxl: 容器尺寸 ≥ 1600px
   * ```
   */
  Col,
  /**
   * 获取栅格响应式布局的配置
   * @param minSize 元素的最小可接受宽度
   * @returns { xs: num, sm: num, md: num, lg: num, xl: num, xxl: num }
   */
  getGridMapByRange,
};
