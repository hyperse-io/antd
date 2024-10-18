import { Form } from 'antd';
import { InputTextAreaWrapper } from '../../input-text-area-wrapper';
import { EditableFormItemProps, EditableTextareaConfig } from '../type';

export const TextAreaFormItem = (props: EditableFormItemProps) => {
  const { formItemProps, editableConfig } = props.fieldConfig;
  return (
    <Form.Item {...formItemProps} name={props.name}>
      <InputTextAreaWrapper
        {...(editableConfig as EditableTextareaConfig).editableComptProps}
      />
    </Form.Item>
  );
};
