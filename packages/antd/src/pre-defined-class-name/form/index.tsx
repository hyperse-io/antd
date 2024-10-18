import { classNames } from '@dimjs/utils';
import './style.less';
/**
 * 使用在Form组件上，预定义form-item label宽度
 */
export const formClassName = {
  label_width_70: 'form-label-70',
  label_width_80: 'form-label-80',
  label_width_90: 'form-label-90',
  label_width_100: 'form-label-100',
  label_width_110: 'form-label-110',
  label_width_120: 'form-label-120',
  label_width_130: 'form-label-130',
  label_width_140: 'form-label-140',
  label_width_150: 'form-label-150',
  label_width_160: 'form-label-160',
  label_width_170: 'form-label-170',
  label_width_180: 'form-label-180',
  label_width_190: 'form-label-190',
  label_width_200: 'form-label-200',
  label_width_auto: 'form-label-auto',
  label_align_left: 'form-label-align-left',
  label_align_right: 'form-label-align-right',
  label_value_vertical: 'form-label-value-vertical',
  /** formItem之间的垂直间距为15 */
  formItemGap15: 'form-formitem-gap-15',
  /** formItem之间的垂直间距为8 */
  formItemGap8: 'form-formitem-gap-8',
  /** formItem之间的垂直间距为8 */
  formItemGap5: 'form-formitem-gap-5',
  /** formItem之间的垂直间距为0 */
  formItemGap0: 'form-formitem-gap-0',
};
/**
 * 使用在Form.Item组件上，预定义form-item label宽度
 */
export const formItemClassName = {
  label_width_70: 'form-item-label-70',
  label_width_80: 'form-item-label-80',
  label_width_90: 'form-item-label-90',
  label_width_100: 'form-item-label-100',
  label_width_110: 'form-item-label-110',
  label_width_120: 'form-item-label-120',
  label_width_130: 'form-item-label-130',
  label_width_140: 'form-item-label-140',
  label_width_150: 'form-item-label-150',
  label_width_160: 'form-item-label-160',
  label_width_170: 'form-item-label-170',
  label_width_180: 'form-item-label-180',
  label_width_190: 'form-item-label-190',
  label_width_200: 'form-item-label-200',
  label_width_auto: 'form-item-label-auto',
  label_align_left: 'form-item-label-align-left',
  label_align_right: 'form-item-label-align-right',
  label_value_vertical: 'form-item-label-value-vertical',
};

export type TFormLayoutPreClassNameProps = {
  /**
   * label宽度，Form内部所有FormItem label都生效
   * ```
   * 1. 可设置数值
   * 2. 可设置`auto`自适应
   * ```
   */
  labelWidth?:
    | 'auto'
    | '70'
    | '80'
    | '90'
    | '100'
    | '110'
    | '120'
    | '130'
    | '140'
    | '150'
    | '160'
    | '170'
    | '180'
    | '190'
    | '200';
  /** labelItem 竖直布局 */
  labelItemVertical?: boolean;
  /** label 对齐方式 */
  labelAlign?: 'left' | 'right';
  /** formItem之间竖直间距，默认值：24 */
  formItemGap?: '24' | '15' | '8' | '5' | '0';
  /**
   * className 中可能会包含 preDefinedClassName.form.xx，优先级大于 labelWidth、labelItemVertical、labelAlign、formItemGap
   */
  className?: string;
};

export const getFormLayoutClassName = (props: TFormLayoutPreClassNameProps) => {
  const oldClassName = props.className || '';
  let newClassName = '';
  if (props.labelWidth) {
    const regex = /.*form-label-\d+.*/;
    if (!regex.test(oldClassName)) {
      newClassName = `form-label-${props.labelWidth}`;
    }
  }
  if (props.labelItemVertical) {
    const regex = /.*form-label-value-vertical.*/;
    if (!regex.test(oldClassName)) {
      newClassName = classNames(newClassName, 'form-label-value-vertical');
    }
  }
  if (props.labelAlign) {
    const regex = /.*form-label-align-(left|right).*/;
    if (!regex.test(oldClassName)) {
      newClassName = classNames(
        newClassName,
        `form-label-align-${props.labelAlign}`
      );
    }
  }
  if (props.formItemGap) {
    const regex = /.*form-formitem-gap-\d+.*/;
    if (!regex.test(oldClassName)) {
      newClassName = classNames(
        newClassName,
        `form-formitem-gap-${props.formItemGap}`
      );
    }
  }

  return classNames(newClassName, oldClassName);
};

export type TFormItemLayoutPreClassNameProps = {
  /**
   * label宽度，Form内部所有FormItem label都生效
   * ```
   * 1. 可设置数值
   * 2. 可设置`auto`自适应
   * ```
   */
  labelWidth?:
    | 'auto'
    | '70'
    | '80'
    | '90'
    | '100'
    | '110'
    | '120'
    | '130'
    | '140'
    | '150'
    | '160'
    | '170'
    | '180'
    | '190'
    | '200';
  /** labelItem 竖直布局 */
  labelItemVertical?: boolean;
  /** label 对齐方式 */
  labelAlign?: 'left' | 'right';
  /**
   * className 中可能会包含 preDefinedClassName.formItem.xx，优先级大于 labelWidth、labelItemVertical、labelAlign
   */
  className?: string;
};

export const getFormItemLayoutClassName = (
  props: TFormItemLayoutPreClassNameProps
) => {
  const oldClassName = props.className || '';
  let newClassName = '';
  if (props.labelWidth) {
    const regex = /.*form-label-\d+.*/;
    if (!regex.test(oldClassName)) {
      newClassName = `form-item-label-${props.labelWidth}`;
    }
  }
  if (props.labelItemVertical) {
    const regex = /.*form-item-label-value-vertical.*/;
    if (!regex.test(oldClassName)) {
      newClassName = classNames(newClassName, 'form-item-label-value-vertical');
    }
  }
  if (props.labelAlign) {
    const regex = /.*form-item-label-align-(left|right).*/;
    if (!regex.test(oldClassName)) {
      newClassName = classNames(
        newClassName,
        `form-item-label-align-${props.labelAlign}`
      );
    }
  }
  return classNames(newClassName, oldClassName);
};
