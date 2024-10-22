import { Form, type FormItemProps } from 'antd';

export type FormItemHiddenProps = {
  name: FormItemProps['name'];
};

export const FormItemHidden = (props: FormItemHiddenProps) => {
  return (
    <Form.Item name={props.name} hidden>
      <span></span>
    </Form.Item>
  );
};

FormItemHidden['domTypeName'] = 'FormItemHidden';
