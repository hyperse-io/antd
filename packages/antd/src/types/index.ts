import { noop } from '@hyperse/utils';

export type FormItemNamePath = string | number | Array<string | number>;
export type TLocale = 'en' | 'zh-cn';

export type TFbaLocale = {
  TreeWrapper?: {
    /** 数据加载异常默认文案 */
    requestError?: string;
  };
  FbaDialogModal?: {
    cancelText?: string;
  };
};

export const types = noop;
