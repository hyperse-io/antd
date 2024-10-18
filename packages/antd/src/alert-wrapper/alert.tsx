import { Alert, type AlertProps } from 'antd';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull } from '@hyperse/utils';
import './style.less';

export type AlertWrapperProps = AlertProps & {
  size?: 'small' | 'default' | 'large';
};

/**
 * antd Alert 无法控制内边距，此组件扩展size属性
 */
export const AlertWrapper = (props: AlertWrapperProps) => {
  const { size, ...otherProps } = props;
  const sizeNew = isUndefinedOrNull(size) ? 'default' : size;

  const className = classNames(
    {
      'alert-wrapper-small': sizeNew === 'small',
      'alert-wrapper-default': sizeNew === 'default',
      'alert-wrapper-large': sizeNew === 'large',
    },
    props.className
  );

  return <Alert {...otherProps} className={className} />;
};
