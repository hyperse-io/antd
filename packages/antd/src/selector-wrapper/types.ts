import { ReactElement } from 'react';
import { SelectProps } from 'antd';
import { TAny, TPlainObject } from '@hyperse/utils';
import { TRequestStatusProps } from '../request-status/index.js';

export type SelectorWrapperValue =
  | string
  | number
  | Array<string | number>
  | TPlainObject<string | number>
  | Array<TPlainObject<string | number>>;

export type SelectorServiceConfig = {
  params?: TPlainObject;
  /** 与 params 配合使用 */
  requiredParamsKeys?: string[];
  onRequest?: (params?: TAny) => Promise<TAny>;
  /**
   * 响应数据适配器
   */
  onRequestResultAdapter?: (respData: TAny) => TPlainObject[];
};

export type SelectorWrapperProps = Omit<
  SelectProps,
  | 'onSearch'
  | 'notFoundContent'
  | 'options'
  | 'fieldNames'
  | 'onChange'
  | 'value'
  | 'loading'
  | 'mode'
> & {
  /** 不支持 tags 模式，tags模式请使用 SelectorWrapperSimple 组件 */
  mode?: 'multiple';
  /** key值，相同的key 同页面可共用缓存数据 */
  modelKey: string;
  /**
   * 参数Key映射
   * ```
   * 1. 默认值：value=value、label=label、disabled=disabled
   * 2. list 为 onRequest 返回数据中列表key值，可多级取值，例如： 'a.b.c'
   * 3. 配置 serviceConfig.onRequestResultAdapter后，fieldNames.list配置失效
   * 4. 如果没有配置list，可说明接口返回为数组
   * ```
   */
  fieldNames?: {
    list?: string;
    label?: string;
    value?: string;
    disabled?: string;
  };
  /**
   * 请求服务需求的数据
   */
  serviceConfig?: SelectorServiceConfig;
  /**
   * 同步设置选择器选项列表
   * ```
   * 1. 如果配置fieldNames，会转换后使用
   * 2. 值为undefined、null不会更新，需要清空可传递空数组
   * ```
   */
  selectorList?: TPlainObject[];
  /**
   * select 数据源发生变更时触发，第一次不调用
   */
  onSelectorListChange?: (dataList: TPlainObject[]) => void;
  /** select 数据源发生变更时触发，每次都会调用 */
  onSelectorListAllChange?: (dataList: TPlainObject[]) => void;
  /**
   * 通过服务获取数据异常回调
   */
  onSelectorRequestError?: (error: Error) => void;
  /**
   * 添加全部选项
   * ```
   * 1. 默认值label="全部"，value=""
   * 2. 可配置label、value
   * ```
   */
  showAllOption?: true | { label: string; value: string | number };
  // label渲染适配器
  onLabelRenderAdapter?: (dataItem: TPlainObject) => string | ReactElement;

  onChange?: (
    value?: SelectorWrapperValue,
    selectedList?: TPlainObject[] | TPlainObject
  ) => void;

  showIcon?: boolean;
  /** select option添加图标；与showIcon组合使用 */
  icon?: (data: TPlainObject, index: number) => ReactElement;

  requestMessageConfig?: TRequestStatusProps['messageConfig'];
  /**
   * value格式
   *```
   * 1. string 、number
   * 2. Array<string | number>
   * 3. lableInValue = true，根据fieldNames配置格式
   * 4. lableInValue = true，Array<fieldNames配置>
   * ```
   */
  value?: SelectorWrapperValue;

  /**
   * 使用缓存，默认值：true
   * ```
   * 1. true: 在 modelKey下使用请求参数缓存数据，如果相同modelKey、相同请求参数直接使用缓存数据
   * 2. false: 每次都调用接口，不参与缓存数据、不使用缓存数据
   * 3. useCache=false 在 serviceConfig.requiredParamsKeys.length > 0 有效
   * ```
   */
  useCache?: boolean;
};
