import { type TAny } from '@hyperse/utils';

export type ParamItem = {
  /** 模版参数code */
  code: string;
  /** 模版参数类型 文本/数字/链接 */
  type: 'text' | 'number' | 'link';
  /** 模版参数 value */
  value: TAny;
} & Record<string, TAny>;
