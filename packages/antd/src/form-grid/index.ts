import { FormCol } from './form-col.js';
import { FormOperateCol } from './form-operate-col.js';
import { FormRow } from './form-row.js';

export const FormGrid = {
  /**
   * FormItem网格响应式布局
   *```
   * 1. 应用场景：Form条件布局
   * 2. 子元素只能是 FormGrid.Col、FormGrid.OperateCol，其他会被忽略
   * 3. 所有子元素中只能存在一个 FormGrid.OperateCol
   */
  Row: FormRow,
  /**
   * 网格响应式布局，默认值：{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
   *```
   * 1. 设置 span 栅格占位格数，替换lg、xl、xxl默认数据，不替换xs、sm布局数据
   * 2. grid 自定义响应式网格布局
   * xs: 屏幕 < 576px
   * sm: 屏幕 ≥ 576px
   * md: 屏幕 ≥ 768px
   * lg: 屏幕 ≥ 992px
   * xl: 屏幕 ≥ 1200px
   * xxl: 屏幕 ≥ 1600px
   * ```
   */
  Col: FormCol,
  /**
   * FormOperateCol 布局说明
   * ```
   * 1. 网格数以及位置为动态计算，不支持 xs、sm、md等
   * 2. 如果FormRow只有一行col，则OperateCol会在当前行剩余网格内居左对齐
   * 3. 如果同时设置 leftList、rightList，则此cell会强制独占一行，并左右布局
   * 4. 如果只设置 leftList、rightList其中一个，则会在最后一行剩余网格内居右对齐
   * ```
   */
  OperateCol: FormOperateCol,
};
