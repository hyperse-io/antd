import { Form, InputNumber } from 'antd';
import { classNames } from '@dimjs/utils';
import {
  type EditableFormItemProps,
  type EditableInputNumberConfig,
} from '../type.js';

export const InputNumberFormItem = (props: EditableFormItemProps) => {
  const { formItemProps, editableConfig } = props.fieldConfig;
  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-input-number-form-item',
        formItemProps?.className
      )}
    >
      <InputNumber
        {...(editableConfig as EditableInputNumberConfig).editableComptProps}
      />
    </Form.Item>
  );
};
