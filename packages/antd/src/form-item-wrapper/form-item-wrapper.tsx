import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';
import { Form, FormItemProps } from 'antd';
import { composeProps, TAny } from '@hyperse/utils';
import { TFormItemLayoutPreClassNameProps } from '../pre-defined-class-name/form/index.js';
import { preDefinedClassName } from '../pre-defined-class-name/index.js';

export type FormItemWrapperProps = FormItemProps &
  TFormItemLayoutPreClassNameProps & {
    wrapper?: (children: ReactNode) => ReactElement;
    /** 设置wrapper后，before、after失效 */
    before?: ReactNode;
    /** 设置wrapper后，before、after失效 */
    after?: ReactNode;
    /** value 序列化处理 */
    inputNormalize?: (value?: TAny) => TAny;
    /**
     * onChange 参数序列化处理
     * 如果设置 normalize 属性，outputNormalize将失效
     */
    outputNormalize?: (value?: TAny) => TAny;
    /** 是否清除 Form.Item  */
    isClear?: boolean;
    /**
     * 栅格占位格数，最大值：24
     * ```
     * 1. 当 FormItemWrapper 处在 EasyForm 直接子节点中有效，即FormItemWrapper在EasyForm栅格中的占位格数；
     * ```
     */
    span?: number;
  };

type FormItemWrapperChildrenProps = Pick<
  FormItemWrapperProps,
  'wrapper' | 'after' | 'before' | 'inputNormalize'
> & {
  children: ReactElement;
};

const FormItemWrapperChildren = (props: FormItemWrapperChildrenProps) => {
  const { wrapper, children, inputNormalize, ...rest } = props;
  // composeProps 合并执行 Form.Item 传的 onChange 以及组件本身的方法
  const hasValue = Object.prototype.hasOwnProperty.call(rest, 'value');
  if (hasValue && inputNormalize) {
    rest['value'] = inputNormalize(rest['value']);
  }
  const _children = cloneElement(
    children,
    composeProps(children.props, rest, true)
  );
  if (wrapper) {
    return wrapper(_children);
  }
  if (props.before || props.after) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {props.before ? (
          <span style={{ marginRight: 10 }}>{props.before}</span>
        ) : null}
        <div style={{ flex: 1 }}>{_children}</div>
        {props.after ? (
          <span style={{ marginLeft: 10 }}>{props.after}</span>
        ) : null}
      </div>
    );
  }
  return _children;
};

/**
 * 对 Form.Item 包装处理
 * ```
 * 1. 为 children 增加 before、after
 * 2. 对输入、输出数据进行序列化处理
 * 3. 内置布局样式使用 preDefinedClassName.formItem
 * ```
 */
export const FormItemWrapper = (props: FormItemWrapperProps) => {
  const {
    wrapper,
    isClear,
    labelWidth,
    labelItemVertical,
    labelAlign,
    children,
    before,
    after,
    inputNormalize,
    outputNormalize,
    className,
    ...rest
  } = props;

  const innerClassName = useMemo(() => {
    return preDefinedClassName.getFormItemLayoutClassName({
      labelWidth,
      labelItemVertical,
      labelAlign,
      className,
    });
  }, [labelWidth, labelItemVertical, labelAlign]);

  if (isClear) return null;

  return (
    <Form.Item normalize={outputNormalize} {...rest} className={innerClassName}>
      {isValidElement(children) ? (
        <FormItemWrapperChildren
          wrapper={wrapper}
          before={before}
          after={after}
          inputNormalize={inputNormalize}
        >
          {children}
        </FormItemWrapperChildren>
      ) : (
        children
      )}
    </Form.Item>
  );
};

FormItemWrapper['domTypeName'] = 'FormItemWrapper';
