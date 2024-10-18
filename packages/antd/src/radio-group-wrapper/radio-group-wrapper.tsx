import { ReactElement } from 'react';
import { Radio, Space } from 'antd';
import { valueIsEqual } from '@hyperse/utils';

export type RadioGroupWrapperValue = string | number | boolean;

export type RadioGroupWrapperOptionItem = {
  label: string | ReactElement;
  value: RadioGroupWrapperValue;
  disabled?: boolean;
};

export type CustomRadioGroupProps = {
  value?: RadioGroupWrapperValue;
  onChange?: (value?: RadioGroupWrapperValue) => void;
  onPreChange?: (value?: RadioGroupWrapperValue) => Promise<void>;
  options: RadioGroupWrapperOptionItem[];
  /** 是否可取消选中，默认：false */
  isCancel?: boolean;
  disabled?: boolean;
};

/**
 * RadioGroupWrapper 为了解决 RadioGroup 组件不能取消选中问题
 * @param props
 * @returns
 */
export const RadioGroupWrapper = (props: CustomRadioGroupProps) => {
  const onChange = async (event) => {
    const value = event.target.value;
    if (props.onPreChange) {
      await props.onPreChange(value);
    }
    props.onChange?.(value);
  };
  const onClick = (event) => {
    if (!props.isCancel) return;
    const value = event.target.value;
    if (valueIsEqual(props.value, value)) {
      props.onChange?.(undefined);
    }
  };
  return (
    <Space size={5} wrap={true}>
      {props.options.map((item) => {
        return (
          <Radio
            value={item.value}
            onClick={onClick}
            checked={props.value === item.value}
            key={String(item.value)}
            onChange={onChange}
            disabled={props.disabled || item.disabled}
          >
            {item.label}
          </Radio>
        );
      })}
    </Space>
  );
};
