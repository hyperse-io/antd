import { Form } from 'antd';
import { InputWrapper } from '../../input-wrapper/index.js';
import { EditableFormItemProps, EditableInputConfig } from '../type.js';

export const InputFormItem = (props: EditableFormItemProps) => {
  const { formItemProps, editableConfig } = props.fieldConfig;

  return (
    <Form.Item {...formItemProps} name={props.name}>
      <InputWrapper
        allowClear
        {...(editableConfig as EditableInputConfig).editableComptProps}
      />
    </Form.Item>
  );
};
