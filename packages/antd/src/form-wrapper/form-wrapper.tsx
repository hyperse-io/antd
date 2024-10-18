import { ReactNode, useMemo } from 'react';
import { Form, FormProps } from 'antd';
import { TFormLayoutPreClassNameProps } from '../pre-defined-class-name/form/index.js';
import { preDefinedClassName } from '../pre-defined-class-name/index.js';

export type FormWrapperProps<Values = any> = TFormLayoutPreClassNameProps &
  FormProps<Values> & {
    children: ReactNode;
  };

/**
 * Form 包装组件，添加对formItem的布局控制
 * ```
 * 1. 内置布局样式使用 preDefinedClassName.form
 * ```
 */
export const FormWrapper = (props: FormWrapperProps) => {
  const {
    labelWidth,
    labelItemVertical,
    labelAlign,
    formItemGap,
    className,
    ...rest
  } = props;

  const innerClassName = useMemo(() => {
    return preDefinedClassName.getFormLayoutClassName({
      labelWidth,
      labelItemVertical,
      labelAlign,
      formItemGap,
      className,
    });
  }, [labelWidth, labelItemVertical, labelAlign, formItemGap]);

  return <Form {...rest} className={innerClassName}></Form>;
};
