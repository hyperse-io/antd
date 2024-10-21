import { ReactNode } from 'react';
import { TAny, TPlainObject } from '@hyperse/utils';
import { FormItemWrapperProps } from '../form-item-wrapper/index.js';

export type FormItemTextServiceConfig = {
  onRequest: (params?: TAny) => Promise<TAny>;
  /** 接口参数，当params发生变化后，会主动发送查询请求 */
  params?: TPlainObject;
  /** 标记serviceConfig.params中无效参数，被设置的params key 不传入服务接口入参  */
  invalidParamKey?: string[];
  /** 如果没有配置 render，返回结果会直接进行dom渲染，如果非string类型会进行JSON.stringify处理 */
  onResponseAdapter?: (respData?: TAny, value?: TAny) => TAny;
  /** 必须参数key列表，与params配合使用 */
  requiredParamsKeys?: string[];
};

export type FormItemTextProps = Omit<FormItemWrapperProps, 'onChange'> & {
  /** 是否换行，默认不换行，超出省略（鼠标悬浮可显示） */
  wrap?: boolean;
  /** 自定义数据显示 */
  render?: (value?: TAny) => ReactNode;
  /** 占位值，当 value 为 ''、undefined、null时显示 */
  placeholderValue?: string;
  /**
   * 发起服务调用显示数据，例如：数据为key，通过key查询text显示
   * ```
   * 1. 当serviceConfig.params发生变化后，会主动发送查询请求
   * ```
   */
  serviceConfig?: FormItemTextServiceConfig;
};
