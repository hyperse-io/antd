import { fbaUtils } from '../fba-utils/fba-utils.js';
import { EasyTable as EasyTableInner } from './easy-table.js';
import { EasyTableFilter } from './filter.js';
import { useEasyTable } from './hooks.js';
import { EasyTableTable } from './table.js';

/**
 * 对 查询条件+表格数据 进行深度封装，内置数据交互处理
 * ```
 * Demo https://fex.qa.tcshuke.com/docs/admin/main/crud/easy-table
 *
 * 1. 废弃modelKey参数
 * 2. 如果需要在路由跳转回退中缓存查询条件，设置cacheSwitch=true；如果存在多个EasyTable缓存情况可设置cacheSwitch为自定义字符串
 * 3. 需要获取查询条件、主动发起请求等可通过ref、useEasyTable操作
 * 4. 可通过属性 initRequest 设置初始化是否请求数据
 * 5. 可通过属性 fieldNames 来设置自定义变量，默认值为：list、total、pageNo、pageSize
 * 6. isFull=true，设置【在父节点高度下，上下铺满】（默认值：true）
 * 7. filterFixed=true，设置查询条件固定，不随滚动条滚动
 * 8. paginationFixed=true，可设置分页条件在底部固定，不随滚动条滚动
 * 9. foldKeys=string[]，查询条件展开、收起，被收起数组内容为EasyTable.Filter 子节点key值
 * 10. windows环境下，会在EasyTable.Table外部包装一下 TableScrollbar，提高windows下table左右滚动体验
 * 11. 可实现部分字段折叠，手动选择显示，将EasyTable.Table columns中isFold属性设为true，可通过EasyTable columnFoldConfig配置属性，demo（https://fex.qa.tcshuke.com/docs/admin/main/crud/demo1）
 * 12. 通过asyncColumnRequest、asyncRender配合使用可实现表格列数据接口渲染（demo：https://fex.qa.tcshuke.com/docs/admin/main/crud/easy-table）
 * ```
 */
export const EasyTable = fbaUtils.attachPropertiesToComponent(EasyTableInner, {
  /**
   * 过滤条件
   *```
   * 1. 用法1
   *  -- 默认网格布局 规则：{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
   *  <EasyTable.Filter>
   *   <FormItemWrapper name="field1" label="条件1">xxx</FormItemWrapper>
   *  </EasyTable.Filter>
   *
   *  -- 自定义网格布局 使用 FormGrid.Col 组件包装 FormItemWrapper
   *  <EasyTable.Filter>
   *    <FormGrid.Col span={12}><FormItemWrapper name="field1" label="条件1">xxx</FormItemWrapper></FormGrid.Col>
   *  </EasyTable.Filter>
   *
   *  -- children 可为 function
   *  <EasyTable.Filter>
   *   {(form) => {
   *     return <FormItemWrapper name="field1" label="条件1">xxx</FormItemWrapper>
   *   }}
   * </EasyTable.Filter>
   * 2. 用户2（自定义布局）
   *    EasyTable.Filter设置 isPure = true，FormItem无布局规则
   * 3. EasyTable.Filter中内置了 Form 标签，当children为函数时，可获取form实例
   * 4. 默认布局下，可通过设置 filterOperate 设置操作按钮
   * 5. Filter 子节点包含 hidden = true 会被忽略
   * 6. 如果想隐藏【查询、重置】按钮中的某一个，可设置 queryButtonProps.hidden、resetButtonProps.hidden
   * 7. EasyTableFilter 子节点可使用 FormItemWrapper，FormItemWrapper中可配置label宽度等
   * 8. 通过easyFormProps属性可整体控制子节点FormItem布局
   *```
   */
  Filter: EasyTableFilter,
  /**
   * 表格渲染
   * @param props
   * ```
   * 1. 继承了 TableProps 可设置antd table功能
   * 2. 分页功能已内置处理，不调用 onChange
   * ```
   */
  Table: EasyTableTable,

  /**  在 EasyTable子组件内才可使用 */
  useEasyTable: useEasyTable,
});
