import {
  formClassName,
  formItemClassName,
  getFormItemLayoutClassName,
  getFormLayoutClassName,
} from './form/index.jsx';

/**
 * 预定义className
 * ```
 * form: 使用在Form组件上，设置form-item label宽度
 * formItem: 使用在Form.Item组件上，设置form-item label宽度
 * ```
 */
export const preDefinedClassName = {
  /**
   * @deprecated，已过期，使用preDefinedClassName.getFormLayoutClassName(...)
   */
  form: formClassName,
  /**
   * @deprecated 已过期，使用preDefinedClassName.getFormItemLayoutClassName(...)
   */
  formItem: formItemClassName,
  /**
   * 获取针对Form下全部label布局的预设className，包括
   * ```
   * 1. formLabel宽度
   * 2. formLabel对齐方式
   * 3. form label value的竖直布局
   * 4. formItem之间的间距
   * ```
   */
  getFormLayoutClassName,
  /**
   * 获取针对单个FormItem label布局的预设className，包括
   * ```
   * 1. formLabel宽度
   * 2. formLabel对齐方式
   * 3. form label value的竖直布局
   * ```
   */
  getFormItemLayoutClassName,
};
