import { type CSSProperties, type ReactElement } from 'react';
import { type FormInstance, type PaginationProps } from 'antd';
import { type ColumnsType } from 'antd/es/table';
import { type TAny, type TPlainObject } from '@hyperse/utils';
import { TipsWrapperProps } from '../tips-wrapper/tips-wrapper.js';

export type TEasyTableTableColumn<T> = ColumnsType<T>[0] & {
  dataIndex?: keyof T | (string & {});
  /**
   * 会在 title 之后展示一个 icon
   * ```
   * 1. title为string类型有效
   * 2. 可为icon添加提示效果
   * 3. 可为icon添加点击事件
   * ```
   */
  tipsWrapperProps?: string | TipsWrapperProps;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 是否折叠在更多中 */
  isFold?: boolean;
  /**
   * 异步数据渲染，与asyncColumnRequest配合使用
   * ```
   * 1. 使用asyncRender后，render配置失效
   * 2. 使用场景为，表格列数据是通过接口查询后渲染的（通常表格数据为code，但是页面渲染要使用name）
   * 3. respData为异步返回数据
   * ```
   */
  asyncRender?: (
    value: TAny,
    record: T,
    index: number,
    respData?: TAny
  ) => React.ReactNode;
};

export type EasyTableServiceConfig = {
  /** 接口配置 */
  onRequest: (params?: TPlainObject) => Promise<TPlainObject | TPlainObject[]>;
  /** 请求参数处理 */
  requestParamsAdapter?: (params: TPlainObject) => TPlainObject;
  /**
   * 接口相应数据处理
   * ```
   * 返回数据为对象，包含两个字段
   * 1. 表格列表数据 - Array
   * 2. 表格条数总数 - Number
   * 其中 字段key 命名会通过 fieldNames 进行转义
   * 例如：
   * fieldNames={{
   *    list: 'aList',
   *    total: 'aTotal',
   *  }}
   *  serviceConfig={{
   *    url: '/v1/board/list',
   *    requestResultAdapter: (respData) => {
   *      return {
   *        aList: respData.data.rows,
   *        aTotal: respData.page.total,
   *      };
   *    },
   *  }}
   * ```
   */
  requestResultAdapter?: (params: TAny) => TPlainObject;
  /**
   * 动态列自定义渲染
   * ```
   * 1. respData: 接口返回数据
   * 2. columns: Table columns配置项
   * ```
   *
   */
  dynamicColumsAdapter?: (
    respData?: TAny,
    columns?: TEasyTableTableColumn<TPlainObject>[]
  ) => TEasyTableTableColumn<TPlainObject>[] | undefined;
};

export type EasyTableProps = {
  className?: string;
  style?: CSSProperties;
  children:
    | ReactElement
    | ReactElement[]
    | ((dataSource?: TAny) => ReactElement);
  /**
   * 缓存查询条件开关，默认false
   * ```
   * 1. 是否缓存表格查询条件，在路由跳转回来时，不会丢失
   * 2. 如果一个页面有多个EasyTable，并需要缓存查询条件，可设置cacheSwitch为唯一字符串
   * ```
   */
  cacheSwitch?: boolean | string;
  /** 接口数据配置 */
  serviceConfig: EasyTableServiceConfig;
  /**
   * 1. 查询条件Form initialValues
   * 2. 接口其他参数，例如常量类型
   */
  initialValues?: TPlainObject;
  /** 分页单页条数，默认值：10 */
  pageSize?: number;
  /**
   * 字段映射，默认值：{ list:'list', total:'total', pageNo:'pageNo', pageSize:'pageSize'  }
   * ```
   * 1. list、total用于解析接口响应数据，可以配置多级，例如：{ list: 'data.rows', total: 'page.total' }
   * 2. pageNo、pageSize用于接口分页入参Key定义，只能一级，例如：pageNo: 'page'
   * ```
   */
  fieldNames?: {
    list?: string;
    total?: string;
    pageNo?: string;
    pageSize?: string;
  };
  /** 初始化是否请求，默认值：true */
  initRequest?: boolean;
  /** 表格数据变更回调 */
  onDataSourceChange?: (dataSource: TAny) => void;
  /** 如果自定义查询按钮，可设置 Form onFinish */
  onFormFinish?: (values?: TPlainObject) => void;
  /** 在父节点高度下，上下铺满；默认值：true */
  isFull?: boolean;
  /** 查询条件固定，不随滚动条滚动  */
  filterFixed?: boolean;
  /** 分页区域固定，不随滚动条滚动 */
  paginationFixed?: boolean;
  /**
   * 1. 配合paginationFixed=true一起使用有效果
   * 2. 当使用Table内的pagination时，在EasyTable.Table中配置分页属性
   */
  pagination?: PaginationProps;
  /**
   * 查询条件展开、收起，被收起key数组；数组内容为EasyTable.Filter 子节点key值
   */
  foldKeys?: string[];
  /** 自定义处理服务异常 */
  onRequestErrorHandle?: (error) => void;
  /**
   * 是否inline模式
   * ```
   * 1. 缩短 EasyTable.Filter 与 EasyTable.Table 之间的距离
   * 2. 取消内边距
   * ```
   */
  isInline?: boolean;
  /** Form 实例 */
  form?: FormInstance;
  /**
   * 字段折叠配置
   * ```
   * 1. 设置EasyTable.Table columns中isFold=true
   * 2. 通过initSelectedKeys、onChange可将选择字段数据外部存储
   * 3. 设置cacheKey后，缓存数据优先级高于initSelectedKeys
   * 4. 必须要设置 EasyTable.Table columns中dataIndex字段（保证在columns中唯一）
   * ```
   */
  columnFoldConfig?: {
    /** 初始化选中数据，缓存数据优先级更高 */
    initSelectedKeys?: string[];
    /** 隐藏默认触发节点 */
    hidden?: boolean;
    /** 自定义图标 */
    icon?: ReactElement;
    /** 文本 */
    text?: string;
    /** 鼠标悬浮文案 */
    hoverTipText?: string;
    /** 缓存key，默认false，如果设置会将选择字段数据缓存在浏览器中 */
    cacheKey?: string;
    /** 折叠字段选择事件 */
    onChange?: (keys: string[]) => void;
    /** 触发交互弹出类型 */
    triggerType?: 'drawer' | 'dropdown';
  };
  /**
   * 配置表格列中需要异步请求数据
   * ```
   * 1. 与table column asyncRender配合使用
   * ```
   */
  asyncColumnRequest?: {
    dataIndex: string;
    onRequest: () => Promise<TAny>;
  }[];
  /**
   * 调用接口前自定义判断，返回Promise.resolve才能发起查询操作
   * ```
   * 例如：
   *  breforeRequest={async (form) => {
   *    await sleep(100);
   *    return form.validateFields();
   *  }}
   * ```
   */
  breforeRequest?: (form: FormInstance) => Promise<void>;
};

export type EasyTableRefApi = {
  /** 外部发起请求服务 */
  onRequest: (params?: TPlainObject) => void;
  /** 获取请求参数 */
  getRequestParams: () => TPlainObject;
  /**
   * 清除Form查询条件
   * ```
   * 1. 会执行form.resetFields();
   * 2. values 为清除后指定赋值form的数据
   * ```
   */
  clearQueryCondition: (values?: TPlainObject) => Promise<void>;
  /** 更新Form查询条件，不会执行form.resetFields(); */
  updateQueryCondition: (values: TPlainObject) => Promise<void>;
  /** 搜素表单实例 */
  form: FormInstance;
  /** 重置请求 */
  onResetRequest: (params?: TPlainObject) => void;
  /**
   * 表格数据源，用在 useEffect、useMemo 中，可保持引用不变
   */
  dataSource: TAny;
  /**
   * 接口数据源
   * ```
   * 1. 每次获取到的都是新的实例
   * 2. 可使用 easyTableRefApi.dataSource，获取不变实例
   * ```
   */
  getDataSource: () => TAny;
  /** 过滤表格数据源，不会触发 onDataSourceChange 函数 */
  onFilterDataSource: (dataSource: TPlainObject[]) => void;
  /** 清空表格数据 */
  onClearDataSource: () => void;
  /** 修改表格数据源，会触发onDataSourceChange函数  */
  onUpdateDataSource: (dataList: TPlainObject[]) => void;
  /** 自定义字段折叠触发位置，默认位置在最后一个字段标题右侧 */
  columnFoldTriggerRender: (children: ReactElement) => ReactElement;
  /** 查询loading状态 */
  loading?: boolean;
  /**
   * 更新 table columns 数据
   * ```
   * 1. 初始化阶段可使用 EasyTable.serviceConfig.dynamicColumsAdapter 实现动态表格列
   * demo: https://fex.qa.tcshuke.com/docs/admin/main/table/easy-table?tabKey=key7
   * ```
   */
  onChangeTableColumns: (
    columns: TEasyTableTableColumn<TPlainObject>[]
  ) => void;

  getTableColumns: () => TEasyTableTableColumn<TPlainObject>[];
};
